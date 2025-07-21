import { type FastifyInstance } from "fastify";

import greetingSchema from "@/schema/greeting";

async function greetingRoute(app: FastifyInstance) {
    const msg_list = [
        'Hello',
        'Hi',
        'Welcome',
        'Greeting',
        'Hola'
    ];

    // GET
    app.get('/greet', { schema: greetingSchema }, async (_request, response) => {
        const min = 0;
        const max = msg_list.length - 1;
        const index = Math.floor(Math.random() * (max - min + 1)) + min;

        return response.code(200).send({
            msg: msg_list[index]
        });
    });
}

export default greetingRoute;