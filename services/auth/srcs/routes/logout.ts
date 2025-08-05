import { FastifyInstance } from 'fastify';
import jwtLib from 'jsonwebtoken';
import { prisma } from '../db';
import { get_JWT_secret } from '../utils/jwt';

export async function logoutRoute(fastify: FastifyInstance) {
    fastify.post('/logout', async (request, reply) => {
        try {
            const refreshToken = request.cookies.refresh_token;

            if (refreshToken) {
                let decoded: any;
                const secrets = await get_JWT_secret();

                try {
                    decoded = jwtLib.verify(refreshToken, secrets.refresh_secret);
                }
                catch (err) {
                    decoded = null;
                }

                if (decoded?.id) {
                    await prisma.refreshToken.deleteMany({
                        where: {
                            user_id: decoded.id
                        }
                    });
                }
            }

            // Clear the cookies by setting them expired
            reply
                .clearCookie('access_token', { path: '/' })
                .clearCookie('refresh_token', { path: '/' })
                .code(200)
                .send();
        }
        catch (err) {
            reply.code(500).send({ error: 'Internal server error' });
        }
    });
}