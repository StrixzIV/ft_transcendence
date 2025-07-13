import Fastify from 'fastify';

async function createServer() {
    const fastify = Fastify({ logger: true });

    return fastify;
}

createServer().then((app) => {
    app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
        if (err) {
            process.exit(1);
        }
    });
});