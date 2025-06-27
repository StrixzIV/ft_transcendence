import Fastify from 'fastify';
import cors from '@fastify/cors';

import { userRoute } from './routes/user';

const app = Fastify({ logger: true });

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
