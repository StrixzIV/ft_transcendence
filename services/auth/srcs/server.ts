import fs from 'fs';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

import { userRoute } from './routes/user';
import { loginRoute } from './routes/login';

import { get_JWT_secret } from './utils/jwt';

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

    const jwt_secrets = await get_JWT_secret()

    await app.register(jwt, {
        secret: jwt_secrets.access_secret
    })

    app.decorate('authenticate', async (request: FastifyRequest, response: FastifyReply) => {

        try {
            await request.jwtVerify()
        }
        
        catch (err) {
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

    return app

}

initialize_server().then((app) => {
    app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
        if (err) {
            app.log.error(err);
            process.exit(1);
        }
    });
})


