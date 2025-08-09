const error_schema = {
    type: 'object',
    required: ['error'],
    properties: {
        error: { type: 'string' }
    }
};

export default error_schema;