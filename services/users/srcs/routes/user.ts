import path from "path";
import { Readable } from "stream";
import { FastifyInstance } from 'fastify';
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

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
                await new Promise(r => setTimeout(r, 50));
            }

            return null;
        
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
                await new Promise(r => setTimeout(r, 50));
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

            response.header('Cache-Control', 'public, max-age=30');

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

    fastify.get('/image/:uid', async (request, response) => {

        const token = request.cookies["access_token"];
        const { uid } = request.params as { uid: string };

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        if (!uid) {
            return response.status(400).send({ error: "Missing UID" });
        }

        try {

            const token_data = await JWTValidate(token);
            
            if (!token_data.valid) {
                return response.status(401).send({ error: "Invalid token" });
            }

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

            response.header('Cache-Control', 'public, max-age=30');

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
    
    fastify.post('/image', async (request, response) => {

        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        const result = await JWTValidate(token);
        if (!result.valid) return response.status(401).send({ error: "Invalid token" });

        const uid = result.data.id;
        const data = await request.file();
        if (!data) return response.status(400).send({ error: "No file uploaded" });

        if (!data.mimetype.startsWith("image/")) {
            return response.status(400).send({ error: "Only image uploads are allowed" });
        }

        const chunks: Buffer[] = [];
        
        for await (const chunk of data.file) {
            chunks.push(chunk);
        }

        const file_buf = Buffer.concat(chunks);

        const ext = path.extname(data.filename).replace('.', '')
        const s3_key = `${uid}.${ext}`

        await s3.send(new PutObjectCommand({
            Bucket: "ft-transendence-images",
            Key: s3_key,
            Body: file_buf,
            ContentType: data.mimetype,
        }));

        await prisma.users.update({
            where: { id: uid },
            data: { profile_url: s3_key }
        });

        return response.status(201).send({ message: "Upload successful", key: s3_key });

    })

}
