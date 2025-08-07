import { v4 as uuidv4 } from 'uuid';
import { FastifyInstance } from 'fastify';
import { createRoom, deleteRoom } from '../game/pong';

export async function gameRoomRoute(fastify: FastifyInstance) {

    fastify.post('/room/create', async (request, response) => {

        request.body;

        const gid = uuidv4();
        createRoom(gid);

        return response.status(201).send({ gid });

    })

    fastify.delete('/room/delete/:gid', async (request, response) => {

        const { gid } = request.params as { gid: string };
        deleteRoom(gid);

        return response.status(204).send();

    })

}
