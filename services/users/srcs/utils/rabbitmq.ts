import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function consumeMQData() {

    const conn = await amqp.connect('amqp://broker:5672');
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

                const { id, username, email, created_at } = event.data;

                await prisma.userData.upsert({
                    where: { user_id: id },
                    update: {},
                    create: {
                        user_id: id,
                        username,
                        email,
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
