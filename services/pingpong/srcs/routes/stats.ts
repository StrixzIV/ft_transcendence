import { FastifyInstance } from 'fastify';

import { prisma } from '../db';
import { JWTValidate } from '../utils/rabbitmq';

export async function statsRoute(fastify: FastifyInstance) {

    fastify.get('/stats/history', async (request, reply) => {
        
        const token = request.cookies["access_token"];
        
        if (!token) {
            return reply.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
        
        if (!token_data.valid) {
            return reply.status(401).send({ error: "Invalid token" });
        }

        const uid = token_data.data.id;

        const matchHistory = await prisma.matchPlayer.findMany({
            where: { uid: uid },
            include: {
                match: {
                    include: {
                        players: true,
                    }
                }
            },
            orderBy: {
                match: {
                    created_at: 'desc'
                }
            }
        });

        return reply.status(200).send(matchHistory);

    });

    fastify.get('/stats/history/:uid', async (request, reply) => {
        
        const { uid } = request.params as { uid: string };
        const token = request.cookies["access_token"];
        
        if (!token) {
            return reply.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
        
        if (!token_data.valid) {
            return reply.status(401).send({ error: "Invalid token" });
        }

        const matchHistory = await prisma.matchPlayer.findMany({
            where: { uid: uid },
            include: {
                match: {
                    include: {
                        players: true,
                    }
                }
            },
            orderBy: {
                match: {
                    created_at: 'desc'
                }
            }
        });

        return reply.status(200).send(matchHistory);

    });

    fastify.get('/stats/winrate', async (request, reply) => {

        const token = request.cookies["access_token"];
        
        if (!token) {
            return reply.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
        
        if (!token_data.valid) {
            return reply.status(401).send({ error: "Invalid token" });
        }

        const uid = token_data.data.id;
        const completedMatches = await prisma.match.findMany({
            where: {
                status: 'completed',
                players: {
                    some: {
                        uid: uid
                    }
                }
            }
        });

        let wins = 0;
        let losses = 0;

        for (const match of completedMatches) {

            console.log('Type of match.winner_id:', typeof match.winner_id, 'Value:', match.winner_id);
            console.log('Type of uid:', typeof uid, 'Value:', uid);
            
            if (match.winner_id === uid) {
                wins++;
            }
            
            else {
                losses++;
            }

        }

        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

        return reply.status(200).send({
            wins,
            losses,
            totalMatches,
            winRate: winRate.toFixed(2)
        });

    });

    fastify.get('/stats/winrate/:uid', async (request, reply) => {

        const { uid } = request.params as { uid: string };
        const token = request.cookies["access_token"];
        
        if (!token) {
            return reply.status(401).send({ error: "Missing token" });
        }

        const token_data = await JWTValidate(token);
        
        if (!token_data.valid) {
            return reply.status(401).send({ error: "Invalid token" });
        }

        const completedMatches = await prisma.match.findMany({
            where: {
                status: 'completed',
                players: {
                    some: {
                        uid: uid
                    }
                }
            }
        });

        let wins = 0;
        let losses = 0;

        for (const match of completedMatches) {

            console.log('Type of match.winner_id:', typeof match.winner_id, 'Value:', match.winner_id);
            console.log('Type of uid:', typeof uid, 'Value:', uid);
            
            if (match.winner_id === uid) {
                wins++;
            }
            
            else {
                losses++;
            }

        }

        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

        return reply.status(200).send({
            wins,
            losses,
            totalMatches,
            winRate: winRate.toFixed(2)
        });

    });

}
