import fs from 'fs';

import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { FastifyRequest, FastifyReply } from 'fastify';

import { userRoute } from './routes/user';
import { loginRoute } from './routes/login';
import { googleRoute } from './routes/google';
import { twoFactorRoute } from './routes/2fa';
import { refreshRoute } from './routes/refresh';
import { logoutRoute } from './routes/logout';

import { get_JWT_secret } from './utils/jwt';

import { connectRabbitMQ, JWTValidationConsumer } from './utils/rabbitmq'

const log_filestream = fs.createWriteStream('/logs/auth.log', { flags: 'a' })
const endpoint_prefix = '/auth'

async function initialize_server() {

    const app = Fastify({ 
        logger: {
            stream: log_filestream
        }
    })

    app.register(cors, {
        origin: '*'
    })
    app.register(cookie)

    const jwt_secrets = await get_JWT_secret()
    await app.register(jwt, {
        secret: jwt_secrets.access_secret,
        sign: {
            expiresIn: '15m'
        }
    })

    app.decorate('authenticate', async (request: FastifyRequest, response: FastifyReply) => {

        try {
            await request.jwtVerify()
        }

        catch (err) {

            if ((err as { name: string } ).name == "TokenExpiredError") {
                response.code(401).send({ error: 'Token expired' })
                return
            }
            response.code(401).send({ error: 'Invalid or missing token' })

        }

    })

    // API register point
    app.register(userRoute, {
        prefix: endpoint_prefix
    });

    app.register(loginRoute, {
        prefix: endpoint_prefix
    });

    app.register(googleRoute, {
        prefix: endpoint_prefix
    });

    app.register(refreshRoute, {
        prefix: endpoint_prefix
    });

    app.register(twoFactorRoute, {
        prefix: endpoint_prefix
    });

    app.register(logoutRoute, {
        prefix: endpoint_prefix
    });

    return app

}

(async () => {

    try {

        // RabbitMQ Server/Consumer
        await connectRabbitMQ();
        await JWTValidationConsumer();

        const app = await initialize_server();

        app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
            if (err) {
                app.log.error(err);
                process.exit(1);
            }
        });

    }

    catch (err) {
        console.error('[Startup error]: ', err)
        process.exit(1)
    }

})();
