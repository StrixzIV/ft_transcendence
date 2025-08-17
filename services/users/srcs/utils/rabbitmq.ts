import path from "path";
import amqp from 'amqplib';
import mime from "mime-types";

import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from './s3';
import { prisma } from '../db';
import { vault } from "./vault_client";

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
    rabbit_url = `amqp://${rabbit_user!}:${rabbit_password!}@broker:5672`;

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

export async function consumeMQData() {
    const conn = await getRabbitMQConnection();
    const channel = await conn.createChannel();

    await channel.assertExchange('user.events', 'fanout', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(q.queue, 'user.events', '');
    console.log('[User Data Service] Waiting for user.created events...');

    channel.consume(q.queue, async (msg) => {

        if (!msg?.content) return;

        try {
            const event = JSON.parse(msg.content.toString());

            if (event.event === 'user.created') {
                const { id, username, mail, created_at, profile_url } = event.data;

                if (profile_url) {

                    const profile_res = await fetch(profile_url);

                    if (!profile_res.ok) {
                        throw new Error(`Failed to fetch image: ${profile_res.status}`)
                    }

                    const contentType = profile_res.headers.get("content-type") 
                        || mime.lookup(profile_url) 
                        || "application/octet-stream";

                    let ext = mime.extension(contentType) || path.extname(new URL(profile_url).pathname).slice(1) || "bin";

                    const s3_key = `${id}.${ext}`
                    const array_buf = await profile_res.arrayBuffer();
                    const buffer = Buffer.from(array_buf);

                    await s3.send(new PutObjectCommand({
                        Bucket: "ft-transendence-images",
                        Key: s3_key,
                        Body: buffer,
                        ContentType: contentType,
                    }));

                    await prisma.users.upsert({
                        where: { id: id },
                        update: {},
                        create: {
                            id: id,
                            username,
                            mail,
                            created_at: new Date(created_at),
                            profile_url: s3_key.split('/').slice(-1)[0]
                        }
                    });
                }
                else {
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
                }
                console.log(`[User Data Service] User ${username} saved.`);
            }
            else if (event.event === 'user.name_changed') {
                const { id, username } = event.data;

                await prisma.users.update({ 
                    data: { 
                        username: username
                    },
                    where: {
                        id: id
                    }
                });
            }
        }
        catch (error) {
            console.error('[Consumer Error]', error);
        }
    }, { noAck: true });
}

export async function JWTValidate(token: string) {
    const conn = await getRabbitMQConnection();
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
