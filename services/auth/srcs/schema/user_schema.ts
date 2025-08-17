import { FastifySchema } from "fastify";
import { userinfo_schema } from "./shared/userinfo_schema";
import error_schema from "./shared/error_schema";

const user_schema: FastifySchema = {
    body: {
        type: 'object',
        required: ['username', 'mail'],
        properties: {
            username: { type: 'string', minLength: 1, maxLength: 24 },
            mail: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        }
    },
    response: {
        200: userinfo_schema,
        400: error_schema,
        409: error_schema,
        500: error_schema
    }
};

export default user_schema;