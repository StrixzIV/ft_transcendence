import fs from 'fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { userRoute } from './routes/user';

const log_filestream = fs.createWriteStream('../../logs/auth.log', { flags: 'a' })

const app = Fastify({ 
    logger: {
        stream: log_filestream
    }
});

app.register(cors, {
    origin: '*'
});

app.register(userRoute);

app.listen({ port: 3000, host: '0.0.0.0' }, err => {

    if (err) {
        app.log.error(err);
        process.exit(1);
    }
  
});
