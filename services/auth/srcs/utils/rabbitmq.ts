import amqp from 'amqplib';
import jwtLib from 'jsonwebtoken';
import { get_JWT_secret } from './jwt';
import { vault } from './vault_client';

let rabbit_url: string | null = null;
let channel: amqp.Channel | null = null;

export async function get_rabbit_url() {
    if (rabbit_url) {
        return rabbit_url;
    }

    const rabbit_secret = await vault.read('secret/data/broker');
    const rabbit_user = rabbit_secret.data.data.rabbit_user;
    const rabbit_password = rabbit_secret.data.data.rabbit_password;

    // create url
    rabbit_url = `amqp://${rabbit_user!}:${rabbit_password!}@broker:5672`;

    return rabbit_url;
}

export async function connectRabbitMQ() {
    const url = await get_rabbit_url();
    const conn = await amqp.connect(url);

    channel = await conn.createChannel();

    await channel.assertExchange('user.events', 'fanout', { durable: true });
    console.log('[Auth Service] RabbitMQ connected.');
}

export function publishUserCreated(user: { id: string, username: string, mail: string, created_at: Date }) {
    if (!channel) {
        console.error('[Auth Service] RabbitMQ channel not initialized.');
        return;
    }

    const payload = Buffer.from(JSON.stringify({
        event: 'user.created',
        data: {
            id: user.id,
            username: user.username,
            mail: user.mail,
            created_at: user.created_at
        }
    }));

    channel.publish('user.events', '', payload);
    console.log('[Auth Service] Published user.created event.');
}

export async function JWTValidationConsumer() {
    const url = await get_rabbit_url();
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();
    const queue = 'rpc.validate-jwt';
    const secrets = await get_JWT_secret();

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
