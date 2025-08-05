import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { access_cookie_properties, get_JWT_secret, refresh_cookie_properties } from '../utils/jwt';

import { type UserInfo } from '../interfaces/request_data'
import { publishUserCreated } from '../utils/rabbitmq';
import user_schema from '../schema/user_schema';
import { JWTInfo } from '../interfaces/jwt';
import { CascadeUserData } from '../interfaces/cascade_data';
import { JWT_REFRESH_TIMEOUT } from '../config/jwt';

export async function userRoute(fastify: FastifyInstance) {
    fastify.post('/user', {schema: user_schema}, async (request, response) => {
        const forbidden_regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        const { username, mail, password } = request.body as UserInfo;

        if (forbidden_regex.test(username)) {
            return response.code(400).send({ error: 'Username contains special characters' });
        }

        const user_existed = await prisma.users.findFirst({
            where: {
                OR: [{ username: username }, { email: mail }]
            }
        });

        if (user_existed) {
            return response.code(409).send({ error: 'Username or email already exists' });
        }

        let hashed_password: string | undefined = undefined;

        if (password) {
            hashed_password = await bcrypt.hash(password, 10)
        }

        const user_data = await prisma.users.create({ 
            data: { 
                username: username,
                email: mail,
                pasword_hash: hashed_password
            } 
        })

        const secrets = await get_JWT_secret();
        const token = fastify.jwt.sign({
            id: user_data.id,
            username: user_data.username
        });

        const raw_refresh_token = jwtLib.sign(
            { id: user_data.id },
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
                user_id: user_data.id,
                token_hash: hashed_refresh_token,
                created_at: new Date(decoded.iat * 1000),
                expires_at: new Date(decoded.exp * 1000)
            }
        });

        response.setCookie('access_token', token, access_cookie_properties);
        response.setCookie('refresh_token', raw_refresh_token, refresh_cookie_properties);

        const cascade_data = {
            id: user_data.id,
            username: user_data.username,
            mail: user_data.email,
            created_at: user_data.created_at
        } as CascadeUserData;

        publishUserCreated(cascade_data);

        return response.code(201).send({
            user: {
                id: user_data.id,
                username: user_data.username,
                mail: user_data.email
            },
            expires_at: decoded.exp
        });
    });

    // TODO: delete at prod
    // fastify.delete('/user/:id', async (request, response) => {
    //     const access_token = request.cookies['access_token'];

    //     if (!access_token) {
    //         return response.code(403).send({ error: "Missing access token" })
    //     }

    //     let decoded;

    //     try {
    //         decoded = fastify.jwt.verify(access_token) as JWTInfo;
    //     }
    //     catch (err) {
    //         return response.code(401).send({ error: "Invalid or expired access token" })
    //     }

    //     const { id } = request.params as { id: string };

    //     try {
    //         const deletedUser = await prisma.users.delete({
    //             select: {
    //                 id: true,
    //                 username: true,
    //                 email: true,
    //                 created_at: true
    //             },
    //             where: {
    //                 id: id
    //             }
    //         });
    //         return response.code(200).send({ message: 'User deleted', user: deletedUser });
    //     }
    //     catch (err: any) {
    //         // Target record does not exist
    //         if (err.code === 'P2025') {
    //             return response.code(404).send({ error: 'User not found' });
    //         }

    //         return response.code(500).send({ error: 'Internal server error' });
    //     }
    // });
}
