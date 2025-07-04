import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { type UserInfo } from '../interfaces/request_data'

const user_schema = {
    body: {
        type: 'object',
        required: ['name', 'mail'],
        properties: {
            name: { type: 'string', minLength: 1 },
            mail: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        }
    }
}

export async function userRoute(fastify: FastifyInstance) {

    fastify.get('/user', async () => {
        return prisma.users.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true
            }
        })
    })

    fastify.post('/user', {schema: user_schema}, async (request, response) => {

        // User creation logic

        const forbidden_regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
        const { name, mail, password } = request.body as UserInfo

        if (forbidden_regex.test(name)) {
            return response.code(400).send({ error: 'Username contains special characters' });
        }

        const user_existed = await prisma.users.findFirst({
            where: {
                OR: [{ username: name }, { email: mail }]
            }
        })

        if (user_existed) {
            return response.code(409).send({ error: 'Username or email already exists' });
        }
        
        let hashed_password: string | undefined = undefined;

        if (password) {
            hashed_password = await bcrypt.hash(password, 10)
        }

        const user_data = await prisma.users.create({ 
            data: { 
                username: name,
                email: mail,
                pasword_hash: hashed_password
            } 
        })

        const token = fastify.jwt.sign({
            id: user_data.id,
            username: user_data.username
        })

        return response.code(201).send({
            data: {
                id: user_data.id,
                username: user_data.username,
                email: user_data.email,
                profile_url: user_data.profile_url,
                created_at: user_data.created_at
            }, 
            jwt_token: token
        })

    })

    fastify.delete('/user/:id', async (request, response) => {

        const { id } = request.params as { id: string }

        try {

            const deletedUser = await prisma.users.delete({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    created_at: true
                },
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
