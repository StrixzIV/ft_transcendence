import amqp from 'amqplib';
import { prisma } from '../db';
import { v4 as uuidv4 } from "uuid";

export async function consumeMQData() {

    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_DEFAULT_USER ?? ''}:${process.env.RABBITMQ_DEFAULT_PASS ?? ''}@broker:5672`);
    const channel = await conn.createChannel();

    await channel.assertExchange('user.events', 'fanout', { durable: true });
    const q = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(q.queue, 'user.events', '');

    console.log('[User Data Service] Waiting for user.created events...');

    channel.consume(q.queue, async (msg) => {
        if (!msg?.content) return;

        try {
            const event = JSON.parse(msg.content.toString());

            if (event.event === 'user.created') {

                const { id, username, mail, created_at } = event.data;

                await prisma.users.upsert({
                    where: { id: id },
                    update: {},
                    create: {
                        id: id,
                        username,
                        mail,
                        created_at: new Date(created_at)
                    }
                });

                console.log(`[User Data Service] User ${username} saved.`);
            }
        } catch (error) {
            console.error('[Consumer Error]', error);
        }
    }, { noAck: true });
}

export async function JWTValidate(token: string) {

    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_DEFAULT_USER ?? ''}:${process.env.RABBITMQ_DEFAULT_PASS ?? ''}@broker:5672`);
    const channel = await conn.createChannel();

    const correlationId = uuidv4();
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
