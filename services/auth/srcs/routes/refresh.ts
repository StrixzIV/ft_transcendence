import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { access_cookie_properties, get_JWT_secret } from '../utils/jwt';
import { JWTInfo } from '../interfaces/jwt';

export async function refreshRoute(fastify: FastifyInstance) {
    fastify.post('/refresh', async (request, response) => {
        const refresh_token = request.cookies['refresh_token'];

        if (!refresh_token) {
            return response.code(401).send({ error: "Missing refresh token" });
        }

        const secrets = await get_JWT_secret();

        try {
            const payload = jwtLib.verify(
                refresh_token,
                secrets.refresh_secret
            ) as JWTInfo;

            const user_id = payload.id;
            const tokens = await prisma.refreshToken.findMany({
                where: { user_id }
            });

            const matches = await Promise.all(
                tokens.map(async (t) => {
                    const isMatch = await bcrypt.compare(refresh_token, t.token_hash);
                    return isMatch ? t : null;
                })
            );

            const validToken = matches.find((t) => t !== null);

            if (!validToken) {
                return response.code(401).send({ error: 'Invalid refresh token' });
            }

            const user = await prisma.users.findUnique({
                where: { id: user_id }
            });

            if (!user) {
                return response.code(401).send({ error: "User doesn't exist" });
            }

            const access_token = fastify.jwt.sign({ 
                id: user.id,
                username: user.username
            });

            response.setCookie('access_token', access_token, access_cookie_properties);

            return response.send(200);
        } 
        catch (err) {
            return response.code(401).send({ error: 'Invalid or expired refresh token' });
        }
    });
}
