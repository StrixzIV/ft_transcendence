import { FastifySchema } from "fastify";

const greetingSchema: FastifySchema = {
    response: {
        200: {
            type: 'object',
            required: ['msg'],
            properties: {
                msg: { type: 'string' }
            }
        }
    }
};

export default greetingSchema;