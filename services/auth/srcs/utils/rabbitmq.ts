import amqp from 'amqplib';
import jwtLib from 'jsonwebtoken';

import { prisma } from "../db";
import { get_JWT_secret } from './jwt';

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_DEFAULT_USER ?? ''}:${process.env.RABBITMQ_DEFAULT_PASS ?? ''}@broker:5672`);
    channel = await connection.createChannel();
    await channel.assertExchange('user.events', 'fanout', { durable: true });
    console.log('[Auth Service] RabbitMQ connected.');
}

export async function publishUserCreated(user: { id: string, username: string, mail: string, created_at: Date }) {

    if (!channel) {
        console.error('[Auth Service] RabbitMQ channel not initialized.');
        return;
    }

    const user_info = await prisma.users.findUnique({
        where: { id: user.id },
    })

    const payload = Buffer.from(JSON.stringify({
        event: 'user.created',
        data: {
            id: user.id,
            username: user.username,
            mail: user.mail,
            created_at: user.created_at,
            profile_url: user_info?.profile_url
        }
    }));

    channel.publish('user.events', '', payload);
    console.log('[Auth Service] Published user.created event.');
    
}

export async function JWTValidationConsumer() {

    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_DEFAULT_USER ?? ''}:${process.env.RABBITMQ_DEFAULT_PASS ?? ''}@broker:5672`);
    const channel = await conn.createChannel();
    const queue = 'rpc.validate-jwt';

    const secrets = await get_JWT_secret()
  
    await channel.assertQueue(queue, { durable: false });
  
    console.log('[Auth Service] Waiting for JWT validation requests...');
  
    channel.consume(queue, async (msg) => {

        if (!msg) return;
    
        const correlationId = msg.properties.correlationId;
        const replyTo = msg.properties.replyTo;

        let response: any;

        try {
            const { access_token } = JSON.parse(msg.content.toString());
            const decoded = jwtLib.verify(access_token, secrets.access_secret) as { iat: number, exp: number, id: string }
            response = { valid: true, data: decoded };
        }
        
        catch (err) {
            response = { valid: false };
        }
    
        // Reply back
        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId }
        );
    
        channel.ack(msg);
 
    });

}
