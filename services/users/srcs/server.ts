import fs from 'fs';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { consumeMQData } from './utils/rabbitmq'
import { userRoute } from './routes/user';

const log_filestream = fs.createWriteStream('/logs/users.log', { flags: 'a' })
const endpoint_prefix = '/user'

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

    // API register point
    app.register(userRoute, {
        prefix: endpoint_prefix
    });

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
