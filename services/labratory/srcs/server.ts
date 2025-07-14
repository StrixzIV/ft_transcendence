import Fastify from 'fastify';

import logger from '@/utils/logger'
import greetingRoute from '@/routes/greeting';

async function createServer() {
    const loggerEngine = logger();
    const app = Fastify({ logger: loggerEngine });

    // API register point
    app.register(greetingRoute);

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