import { v4 as uuidv4 } from 'uuid';
import { FastifyInstance } from 'fastify';

import { JWTValidate } from '../utils/rabbitmq';
import { createRoom, deleteRoom } from '../game/pong';

export async function gameRoomRoute(fastify: FastifyInstance) {

    fastify.post('/room/create', async (request, response) => {

        const token = request.cookies["access_token"];

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
            
        if (!token_data.valid) {
            return response.status(401).send({ error: "Invalid token" });
        }

        const gid = uuidv4();
        createRoom(gid);

        return response.status(201).send({ gid });

    })

    fastify.delete('/room/delete/:gid', async (request, response) => {

        const token = request.cookies["access_token"];
        const { gid } = request.params as { gid: string };

        if (!gid) {
            return response.status(404).send({ error: "Missing gid" });
        }

        if (!token) {
            return response.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
            
        if (!token_data.valid) {
            return response.status(401).send({ error: "Invalid token" });
        }

        deleteRoom(gid);

        return response.status(204).send();

    })

}
