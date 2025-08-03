import { Readable } from "stream";
import { FastifyInstance } from 'fastify';
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from '../db';
import { JWTValidate } from '../utils/rabbitmq';
import { s3, stream_to_buf } from '../utils/s3';

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

            return null;
        
        } 
        
        catch (err) {
            response.status(500).send({ error: "JWT validation failed" });
        }

    })
    
    fastify.get('/image', async (request, response) => {

        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        try {

            const token_data = await JWTValidate(token);
            
            if (!token_data.valid) {
                return response.status(401).send({ error: "Invalid token" });
            }

            const uid = token_data.data.id;
            const user = await prisma.users.findUnique({ where: { id: uid } });

            let images_name = "default-profile.png";

            if (user) {
                images_name = user.profile_url ?? "default-profile.png";
            }

            console.log(images_name)

            const command = new GetObjectCommand({
                Bucket: "ft-transendence-images",
                Key: images_name
            });
            
            const result = await s3.send(command);
            const buffer = await stream_to_buf(result.Body as Readable);

            response
                .header("Content-Type", result.ContentType)
                .header("Content-Length", buffer.length)
                .send(buffer);

        }
        
        catch (err) {
            request.log.error(err);
            response.status(500).send({ error: "Failed to fetch image" });
        }

    })

}
