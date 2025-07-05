import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { get_JWT_secret } from '../utils/jwt';

interface LoginInfo {
    username: string;
    password: string;
}

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

            const secrets = await get_JWT_secret()

            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username
            });
            
            const raw_refresh_token = jwtLib.sign(
                { id: user.id },
                secrets.refresh_secret,
                { expiresIn: '30d' }
            );

            const hashed_refresh_token = await bcrypt.hash(raw_refresh_token, 10);

            const expires_at = new Date();
            expires_at.setDate(expires_at.getDate() + 30);

            await prisma.refreshToken.create({
                data: {
                    user_id: user.id,
                    token_hash: hashed_refresh_token,
                    expires_at: expires_at
                }
            });

            response.setCookie('refresh_token', raw_refresh_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60
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
