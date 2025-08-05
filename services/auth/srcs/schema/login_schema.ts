import { FastifySchema } from "fastify";
import { partial_userinfo_schema, userinfo_schema } from "./shared/userinfo_schema";
import error_schema from "./shared/error_schema";

const login_schema: FastifySchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 6 }
        }
    },
    response: {
        200: userinfo_schema,
        202: partial_userinfo_schema,
        401: error_schema,
        500: error_schema
    }
};

export default login_schema;