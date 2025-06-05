import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

interface UserInfo {
    name: string;
}

export async function userRoute(fastify: FastifyInstance) {

    fastify.get('/user', async () => {
        return prisma.user.findMany()
    })

    fastify.post('/user', async (request, response) => {

        // User creation logic

        const { name } = request.body as UserInfo
        const user_data = await prisma.user.create({ 
            data: { name } 
        })

        return response.code(201).send(user_data);

    })

}
