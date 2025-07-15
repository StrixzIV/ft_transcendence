import amqp from 'amqplib';

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://broker:5672');
    channel = await connection.createChannel();
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
