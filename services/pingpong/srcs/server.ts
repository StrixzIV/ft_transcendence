import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { gameRoomRoute } from './routes/gameRoom';

const endpoint_prefix = '/game'

async function createServer() {

    const app = Fastify({ logger: true });

    app.register(cors, {
        origin: '*'
    })

    app.register(cookie)

    app.register(gameRoomRoute, {
        prefix: endpoint_prefix
    });

    return app;

}

createServer().then((app) => {
    app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
        if (err) {
            app.log.error(err.message);
            process.exit(1);
        }
    });
});