import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { type LoginInfo } from '../interfaces/request_data'

const login_schema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }
        }
    }
};

export async function loginRoute(fastify: FastifyInstance) {

    fastify.post('/login', { schema: login_schema }, async (request, response) => {
    
        const { username, password } = request.body as LoginInfo;

            const user = await prisma.users.findUnique({
                where: { username: username }
            });

            if (!user) {
                return response.code(401).send({ error: 'User not found' });
            }
            
            if (!user.pasword_hash && !user.google_id) {
                return response.code(401).send({ error: 'Invalid username or password' });
            }
            
            else if (!user.pasword_hash && user.google_id) {
                return response.code(401).send({ error: 'User registered with Google sign-in. Please login with Google' });
            }

            const passwordHash = user.pasword_hash ?? ''
            const passwordMatch = await bcrypt.compare(password, passwordHash);

            if (!passwordMatch) {
                return response.code(401).send({ error: 'Invalid username or password' });
            }

            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username
            });

            return response.code(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                jwt_token: token
            });

    });
}
