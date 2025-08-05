import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { access_cookie_properties, get_JWT_secret, refresh_cookie_properties } from '../utils/jwt';

import { type LoginInfo } from '../interfaces/request_data'
import login_schema from '../schema/login_schema';
import { JWTInfo } from '../interfaces/jwt';
import { JWT_REFRESH_TIMEOUT } from '../config/jwt';

export async function loginRoute(fastify: FastifyInstance) {
    fastify.post('/login', { schema: login_schema }, async (request, response) => {
        const { username, password } = request.body as LoginInfo;

            const user = await prisma.users.findUnique({
                where: { username: username }
            });

            if (!user) {
                return response.code(401).send({ error: "User doesn't exist" });
            }

            if (!user.pasword_hash && !user.google_id) {
                return response.code(401).send({ error: 'Invalid username or password' });
            }
            else if (!user.pasword_hash && user.google_id) {
                return response.code(401).send({ error: 'User registered with Google sign-in. Please login with Google' });
            }

            const passwordHash = user.pasword_hash ?? '';
            const passwordMatch = await bcrypt.compare(password, passwordHash);

            if (!passwordMatch) {
                return response.code(401).send({ error: 'Invalid username or password' });
            }

            if (user.twofa_enable) {
                return response.code(202).send({ user: { id: user.id } });
            }

            const secrets = await get_JWT_secret();
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username
            });

            const raw_refresh_token = jwtLib.sign(
                { id: user.id },
                secrets.refresh_secret,
                { expiresIn: JWT_REFRESH_TIMEOUT }
            );
            const hashed_refresh_token = await bcrypt.hash(raw_refresh_token, 10);
            const decoded = fastify.jwt.decode(raw_refresh_token) as JWTInfo;

            if (!decoded) {
                return response.code(500).send({ error: 'Cannot generate login credential' });
            }

            await prisma.refreshToken.create({
                data: {
                    user_id: user.id,
                    token_hash: hashed_refresh_token,
                    created_at: new Date(decoded.iat * 1000),
                    expires_at: new Date(decoded.exp * 1000),
                }
            });

            response.setCookie('access_token', token, access_cookie_properties);
            response.setCookie('refresh_token', raw_refresh_token, refresh_cookie_properties);

            return response.code(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    mail: user.email
                },
                expires_at: decoded.exp
            });
    });
}
