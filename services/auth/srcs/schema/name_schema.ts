import { FastifySchema } from "fastify";

import error_schema from "./shared/error_schema";
import empty_schema from "./shared/empty_schema";

const user_schema: FastifySchema = {
    body: {
        type: 'object',
        required: ['username'],
        properties: {
            username: { type: 'string', minLength: 1, maxLength: 24 }
        }
    },
    response: {
        200: empty_schema,
        400: error_schema,
        401: error_schema,
        409: error_schema,
        500: error_schema
    }
};

export default user_schema;