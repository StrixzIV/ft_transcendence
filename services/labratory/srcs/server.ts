import Fastify from 'fastify';
import logger from '@/utils/logger'

async function createServer() {
    const loggerEngine = logger();
    const app = Fastify({ logger: loggerEngine });

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