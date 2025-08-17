import amqp from 'amqplib';
import { v4 as uuidv4 } from "uuid";
import { vault } from './vault_client';

let rabbit_url: string | null = null;
let conn: amqp.ChannelModel | null = null;

export async function get_rabbit_url() {
    if (rabbit_url) {
        return rabbit_url;
    }

    const rabbit_secret = await vault.read('secret/data/broker');
    const rabbit_user = rabbit_secret.data.data.rabbit_user;
    const rabbit_password = rabbit_secret.data.data.rabbit_password;

    // create url
    rabbit_url = `amqp://${rabbit_user}:${rabbit_password}@broker:5672`;

    return rabbit_url;
}

export async function getRabbitMQConnection() {
    if (!conn) {
        const url = await get_rabbit_url();

        conn = await amqp.connect(url);
        conn.on('error', (err) => {
            console.error('RabbitMQ connection error:', err);
            conn = null;
        });

        conn.on('close', () => {
            console.warn('RabbitMQ connection closed. Reconnecting...');
            conn = null;
        });
    }

    return conn;
}

export async function JWTValidate(token: string) {
    const correlationId = uuidv4();
    const conn = await getRabbitMQConnection();
    const channel = await conn.createChannel();
    const replyQueue = await channel.assertQueue('', { exclusive: true });

    return new Promise<any>((resolve, reject) => {
        let settled = false;

        // Consume the reply
        const consumerTagPromise = channel.consume(
            replyQueue.queue,
            (msg) => {
                if (msg?.properties.correlationId === correlationId) {
                    
                    if (settled) return;
                    settled = true;

                    const result = JSON.parse(msg.content.toString());
                    resolve(result);

                    // Cleanup: cancel consumer and delete queue
                    channel.cancel(msg.fields.consumerTag).catch(console.error);
                    channel.deleteQueue(replyQueue.queue).catch(console.error);
                }
            },
            { noAck: true }
        );

        // Publish request
        channel.sendToQueue(
            "rpc.validate-jwt",
            Buffer.from(JSON.stringify({ access_token: token })),
            {
                correlationId,
                replyTo: replyQueue.queue,
            }
        );

        // Timeout
        setTimeout(async () => {
            if (settled) return;
            settled = true;
            reject(new Error("JWT validation timeout"));

            // Cancel consumer and delete queue (but DO NOT close channel or connection)
            const { consumerTag } = await consumerTagPromise;
            channel.cancel(consumerTag).catch(console.error);
            channel.deleteQueue(replyQueue.queue).catch(console.error);
        }, 3000);
    });
}
