import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

import { RESTFUL_PREFIX, WS_PREFIX } from './config/url';

import logger from '@/utils/logger'
import greetingRoute from '@/routes/greeting';
import dateRoute from '@/routes/date';

async function createServer() {
    const loggerEngine = logger();
    const app = Fastify({ logger: loggerEngine });

    // Register plugin
    app.register(fastifyWebsocket);

    // API register point
    app.register(greetingRoute, { prefix: RESTFUL_PREFIX });

    // WS register point
    app.register(dateRoute, { prefix: WS_PREFIX });

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