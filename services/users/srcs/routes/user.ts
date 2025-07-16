import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { JWTValidate } from '../utils/rabbitmq';

export async function userRoute(fastify: FastifyInstance) {

    fastify.get('/data', async (request, response) => {

        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(403).send({ error: "Missing token" });
        }

        try {

            const result = await JWTValidate(token);

            console.log(result)
            
            if (!result.valid) {
                return response.status(401).send({ error: "Invalid token" });
            }

            const uid = result.data.id;

            return await prisma.users.findUnique({
                where: { id: uid }
            });
        
        } 
        
        catch (err) {
            console.error(err);
            response.status(500).send({ error: "JWT validation failed" });
        }

    })

}
