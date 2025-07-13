import fs from 'fs'

const logger = (() => {
    const key = process.env['NODE_ENV'] ?? 'development';

    switch (key) {
        case 'test':
            return false;
        case 'development':
            return true;
        case 'production':
            return ({
                stream: fs.createWriteStream('logs/lab.log', { flags: 'a' })
            });
        default:
            return false;
    }
});

export default logger;