import { FastifySchema } from "fastify";
import error_schema from "./shared/error_schema";
import empty_schema from "./shared/empty_schema";
import { userinfo_schema }  from "./shared/userinfo_schema";

export const generate_schema: FastifySchema = {
    response: {
        200: {
            type: 'object',
            required: ['qr_data_url', 'totp_token'],
            properties: {
                qr_data_url: { type: 'string', format: 'uri' },
                totp_token: { type: 'string' }
            }
        },
        401: error_schema,
        500: error_schema
    }
};

export const enable_schema: FastifySchema = {
    response: {
        200: empty_schema,
        401: error_schema,
        409: error_schema
    }
};

export const disable_schema: FastifySchema = {
    response: {
        200: empty_schema,
        401: error_schema,
        409: error_schema
    }
};

export const verify_schema: FastifySchema = {
    body: {
        type: 'object',
        required: ['id', 'token'],
        properties: {
            id: { type: 'string' },
            token: { type: 'string' }
        }
    },
    response: {
        200: userinfo_schema,
        401: error_schema,
        500: error_schema
    }
};
