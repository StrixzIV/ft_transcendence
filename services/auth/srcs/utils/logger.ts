import fs from 'fs'

const logger = (() => {
    switch (process.env['NODE_ENV'] ?? '') {
        case 'test':
            return false;
        case 'development':
            return true;
        case 'production':
            return ({
                stream: fs.createWriteStream('/logs/lab.log', { flags: 'a' })
            });
        default:
            return false;
    }
});

export default logger;