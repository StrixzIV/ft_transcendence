import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

import logger from '@/utils/logger'
import greetingRoute from '@/routes/greeting';
import dateRoute from '@/routes/date';

async function createServer() {
    const loggerEngine = logger();
    const app = Fastify({ logger: loggerEngine });

    // Register plugin
    app.register(fastifyWebsocket);

    // API register point
    app.register(greetingRoute);

    // WS register point
    app.register(dateRoute);

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