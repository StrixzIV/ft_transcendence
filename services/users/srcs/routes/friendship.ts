import { FastifyInstance } from 'fastify';

import { prisma } from '../db';
import { JWTValidate } from '../utils/rabbitmq';

export async function friendshipRoute(fastify: FastifyInstance) {

    fastify.get('/friends', async (request, reply) => {

        const token = request.cookies["access_token"];
        if (!token) return reply.status(401).send({ error: "Missing token" });

        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        try {

            const friendships = await prisma.friendship.findMany({
                where: {
                    status: "accepted",
                    OR: [{ requester_id: author_uid }, { addressee_id: author_uid }]
                },
                include: {
                    requester: true,
                    addressee: true
                }
            });

            const friends = friendships.map(f =>
                f.requester_id === author_uid ? f.addressee : f.requester
            );

            return { friends };

        }
        
        catch {
            return reply.status(500).send({ error: "Could not fetch friends" });
        }

    });

    fastify.get('/friends/requests', async (request, reply) => {

        const token = request.cookies["access_token"];
        if (!token) return reply.status(401).send({ error: "Missing token" });

        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        try {

            const pending = await prisma.friendship.findMany({
                where: { addressee_id: author_uid, status: "pending" },
                include: { requester: true }
            });

            return { requests: pending.map(f => f.requester) };
            
        }
        
        catch {
            return reply.status(500).send({ error: "Could not fetch requests" });
        }

    });

    fastify.post('/friends/:uid', async (request, reply) => {

        const { uid } = request.params as { uid: string };
        const token = request.cookies["access_token"];

        if (!token) return reply.status(401).send({ error: "Missing token" });

        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        if (author_uid === uid) {
            return reply.status(400).send({ error: "You cannot add yourself" });
        }

        const user = await prisma.users.findUnique({ where: { id: uid } });

        if (!user) {
            return reply.status(404).send({ error: "Invalid friend UID. User not found." });
        }

        try {

            const friendship = await prisma.friendship.create({
                data: {
                    requester_id: author_uid,
                    addressee_id: uid,
                    status: "pending"
                }
            });

            return { message: "Friend request sent", friendship };

        }
        
        catch (err: any) {
        
            if (err.code === "P2002") {
                return reply.status(400).send({ error: "Friend request already exists" });
            }
        
            return reply.status(500).send({ error: "Could not create friend request" });
        
        }

    });

    fastify.put('/friends/:uid/accept', async (request, reply) => {

        const { uid } = request.params as { uid: string };

        const token = request.cookies["access_token"];
        if (!token) return reply.status(401).send({ error: "Missing token" });
        
        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        try {

            const record = await prisma.friendship.findMany({
                where: {
                    status: "accepted",
                    // only block if both are already friends.
                    OR: [
                        { requester_id: uid, addressee_id: author_uid },
                        { requester_id: author_uid, addressee_id: uid }
                    ]
                },
                include: {
                    requester: true,
                    addressee: true
                }
            });

            if (record.length > 0) {
                return reply.status(409).send({ error: "Friend request already exists, Please denied the friendship request" });
            }

            const friendship = await prisma.friendship.updateMany({
                where: {
                    requester_id: uid,
                    addressee_id: author_uid,
                    status: "pending"
                },
                data: { status: "accepted" }
            });

            if (friendship.count === 0)
                return reply.status(404).send({ error: "Friend request not found" });

            return { message: "Friend request accepted" };

        }
        
        catch {
            return reply.status(500).send({ error: "Could not accept friend request" });
        }

    });

    fastify.delete('/friends/:uid/deny', async (request, reply) => {

        const { uid } = request.params as { uid: string };

        const token = request.cookies["access_token"];
        if (!token) return reply.status(401).send({ error: "Missing token" });
        
        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        try {

            const friendship = await prisma.friendship.deleteMany({
                where: {
                    requester_id: uid,
                    addressee_id: author_uid,
                    status: "pending"
                }
            });

            if (friendship.count === 0)
                return reply.status(404).send({ error: "Friend request not found" });

            return { message: "Friend request denied" };

        }
        
        catch {
            return reply.status(500).send({ error: "Could not deny friend request" });
        }

    });

    fastify.delete('/friends/:uid', async (request, reply) => {

        const { uid } = request.params as { uid: string };
        
        const token = request.cookies["access_token"];
        if (!token) return reply.status(401).send({ error: "Missing token" });
        
        const result = await JWTValidate(token);
        if (!result.valid) return reply.status(401).send({ error: "Invalid token" });

        const author_uid = result.data.id;

        try {

            const friendship = await prisma.friendship.deleteMany({
                where: {
                    OR: [
                        { requester_id: author_uid, addressee_id: uid },
                        { requester_id: uid, addressee_id: author_uid }
                    ]
                }
            });

            if (friendship.count === 0)
                return reply.status(404).send({ error: "Friendship not found" });

            return { message: "Friend removed" };
        
        }
        
        catch {
            return reply.status(500).send({ error: "Could not remove friend" });
        }

    });

}
