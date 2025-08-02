import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

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

            return await prisma.users.findUnique({
                where: { id: uid }
            });
        
        } 
        
        catch (err) {
            response.status(500).send({ error: "JWT validation failed" });
        }

    })
    
    fastify.get('/image', async (request, response) => {

        try {
            
            const res = await fetch("http://minio:9000/ft-transendence-images/default-profile.png");

            if (!res.ok) {
                return response.status(404).send({ error: "Image not found" });
            }

            const buffer = Buffer.from(await res.arrayBuffer());

            response
                .header("Content-Type", "image/png")
                .header("Content-Length", buffer.length)
                .send(buffer);

        }
        
        catch (err) {
            request.log.error(err);
            response.status(500).send({ error: "Failed to fetch image" });
        }

    })

}
