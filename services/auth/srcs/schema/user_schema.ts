const user_schema = {
    body: {
        type: 'object',
        required: ['username', 'mail'],
        properties: {
            username: { type: 'string', minLength: 1 },
            mail: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        }
    }
};

export default user_schema;