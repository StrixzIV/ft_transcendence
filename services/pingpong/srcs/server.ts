import Fastify from 'fastify';

async function createServer() {
    const app = Fastify({ logger: true });

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