import fs from 'fs';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

import { consumeMQData } from './utils/rabbitmq'

import { userRoute } from './routes/userData';
import { imageRoute } from './routes/image';
import { friendshipRoute } from './routes/friendship';

const MAX_SIZE_MB = 5;
const endpoint_prefix = '/user'
const log_filestream = fs.createWriteStream('/logs/users.log', { flags: 'a' })

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
    app.register(fastifyMultipart, {
        limits: {
            fileSize: MAX_SIZE_MB * 1024 * 1024
        }
    })

    // API register point
    app.register(userRoute, {
        prefix: endpoint_prefix
    })
    
    app.register(imageRoute, {
        prefix: endpoint_prefix
    })
    
    app.register(friendshipRoute, {
        prefix: endpoint_prefix
    })

    return app

}

(async () => {

    try {

        await consumeMQData();
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
