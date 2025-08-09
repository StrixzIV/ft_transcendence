export const userinfo_schema = {
    type: 'object',
    required: ['user', 'expires_at'],
    properties: {
        user: {
            type: 'object',
            required: ['id', 'username', 'mail'],
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                mail: { type: 'string', format: 'email' }
            }
        },
        expires_at: { type: 'integer' }
    }
};

export const partial_userinfo_schema = {
    type: 'object',
    required: ['user'],
    properties: {
        user: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'string' },
            }
        }
    }
};
