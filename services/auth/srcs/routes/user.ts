import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

interface UserInfo {
    name: string;
    mail: string;
}

const user_schema = {
    body: {
        type: 'object',
        required: ['name', 'mail'],
        properties: {
            name: { type: 'string', minLength: 1 },
            mail: { type: 'string', format: 'email' }
        }
    }
}

export async function userRoute(fastify: FastifyInstance) {

    fastify.get('/user', async () => {
        return prisma.users.findMany()
    })

    fastify.post('/user', {schema: user_schema}, async (request, response) => {

        // User creation logic

        const { name, mail } = request.body as UserInfo

        const user_existed = await prisma.users.findFirst({
            where: {
                username: name
            }
        })

        if (user_existed) {
            return response.code(409).send({ error: 'Username already exists' });
        }

        const user_data = await prisma.users.create({ 
            data: { 
                username: name, 
                email: mail 
            } 
        })

        return response.code(201).send(user_data)

    })

    fastify.delete('/user/:id', async (request, response) => {

        const { id } = request.params as { id: string }

        try {

            const deletedUser = await prisma.users.delete({
                where: {
                    id: id
                }
            })

            return response.code(200).send({ message: 'User deleted', user: deletedUser })

        }
        
        catch (err: any) {

            // Target record does not exist
            if (err.code === 'P2025') {
                return response.code(404).send({ error: 'User not found' })
            }

            return response.code(500).send({ error: 'Internal server error' })

        }

    })

}
