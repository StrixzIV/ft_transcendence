import { FastifyInstance } from 'fastify';

import { prisma } from '../db';
import { JWTValidate } from '../utils/rabbitmq';

export async function onlineRoute(fastify: FastifyInstance) {

    fastify.get('/online', { websocket: true }, async (conn, request) => {

        const token = request.cookies["access_token"];

        if (!token) {
            conn.close();
            return;
        }

        const result = await JWTValidate(token);
        
        if (!result.valid) {
            conn.close();
            return;
        }

        await prisma.users.update({
            where: { id: result.data.id },
            data: { status: "ONLINE" }
        });

        conn.send(JSON.stringify({ type: 'connected', message: `Connected successfully as ${result.data.id}` }))

        conn.on('close', async () => {
            await prisma.users.update({
                where: { id: result.data.id },
                data: { status: "OFFLINE" }
            });
        })


    })

}
