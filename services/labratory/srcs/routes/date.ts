import { type FastifyInstance } from 'fastify';

async function dateRoute(app: FastifyInstance) {
    app.get('/date', { websocket: true }, (conn) => {
        const sendDate = setInterval(() => {
            if (conn.readyState === conn.OPEN) {
                const date = new Date();

                conn.send(date.toISOString());
            }
        }, 1000);

        conn.on('close', () => {
            clearInterval(sendDate);
        });
    });
}

export default dateRoute;