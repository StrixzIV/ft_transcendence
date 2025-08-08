import { FastifyInstance } from 'fastify';

import { prisma } from '../db';
import { JWTValidate } from '../utils/rabbitmq';

export async function userRoute(fastify: FastifyInstance) {

    fastify.get('/data', async (request, response) => {

        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        try {

            const result = await JWTValidate(token);
            
            if (!result.valid) {
                return response.status(401).send({ error: "Invalid token" });
            }

            const uid = result.data.id;

            for (let attempt = 0; attempt < 5; attempt++) {
                const user = await prisma.users.findUnique({ where: { id: uid } });
                if (user) return user;
                await new Promise(r => setTimeout(r, 200));
            }

            return response.status(404).send({ error: "User not found" });
        
        } 
        
        catch (err) {
            response.status(500).send({ error: "JWT validation failed" });
        }

    })

    fastify.get('/data/:uid', async (request, response) => {

        const { uid } = request.params as { uid: string };
        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        if (!uid) {
            return response.status(400).send({ error: "Missing UID" });
        }

        try {

            const result = await JWTValidate(token);
            
            if (!result.valid) {
                return response.status(401).send({ error: "Invalid token" });
            }

            for (let attempt = 0; attempt < 5; attempt++) {
                const user = await prisma.users.findUnique({ where: { id: uid } });
                if (user)  return user;
                await new Promise(r => setTimeout(r, 200));
            }

            return null;
        
        } 
        
        catch (err) {
            response.status(500).send({ error: "JWT validation failed" });
        }

    })

}
