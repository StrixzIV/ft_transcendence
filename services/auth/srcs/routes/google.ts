import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import { prisma } from '../db';
import { FastifyInstance } from 'fastify';

import { get_JWT_secret } from '../utils/jwt';
import { publishUserCreated } from '../utils/rabbitmq';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const REDIRECT_URI = "https://localhost:8443/auth/google/callback";

export async function googleRoute(fastify: FastifyInstance) {

    fastify.get('/google', async (request, response) => {

        const random_state = crypto.randomUUID()
        const auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent",
            random_state
        });

        response.redirect(auth_url)

    });

    fastify.get('/google/callback', async (request, response) => {

        const { code } = request.query as { code: string };

        if (!code) {
            return response.redirect('https://localhost:8443/')
        }

        const token_callback = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded" 
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            })
        })

        const token_data = await token_callback.json()

        if (token_data.error) {
            fastify.log.error(token_data)
            return response.code(500).send({ error: "Failed to excahgne code for tokens" })
        }

        const id_token = token_data.id_token;

        const base64_data = id_token.split(".")[1];
        const buffer = Buffer.from(base64_data, "base64");
        const user_data = JSON.parse(buffer.toString());

        const { email, name, picture, sub: googleId } = user_data

        let user = await prisma.users.findUnique({
            where: {
                google_id: googleId,
            }
        })

        if (!user) {

            const basename = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            let username = basename;
            let counter = 1;

            while (await prisma.users.findUnique({ where: { username: username } })) {
                username = `${basename}${counter}`;
                counter++;
            }

            user = await prisma.users.create({
                data: {
                    username: username,
                    email,
                    google_id: googleId,
                    profile_url: picture,
                    pasword_hash: null,
                }
            })
        }

        if (user.totp_secret) {
            return response.redirect(`https://localhost:8443/?id=${user.id}&twofa=true`)
        }

        const secrets = await get_JWT_secret()

        const token = fastify.jwt.sign({
            id: user.id,
            username: user.username
        })

        const raw_refresh_token = jwtLib.sign(
            { id: user.id },
            secrets.refresh_secret,
            { expiresIn: '30d' }
        );

        const hashed_refresh_token = await bcrypt.hash(raw_refresh_token, 10);
        const decoded = fastify.jwt.decode(raw_refresh_token) as { iat: number, exp: number }

        if (!decoded) {
            return response.code(500).send({ error: 'Cannot get iat field from JWT' });
        }

        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token_hash: hashed_refresh_token,
                created_at: new Date(decoded.iat * 1000),
                expires_at: new Date(decoded.exp * 1000)
            }
        });

        response.setCookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60
        });

        response.setCookie('refresh_token', raw_refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60
        });

        const cascade_data = {
            id: user.id,
            username: user.username,
            mail: user.email,
            created_at: user.created_at
        } as { id: string; username: string; mail: string; created_at: Date; }

        publishUserCreated(cascade_data)
        response.redirect(`https://localhost:8443/?id=${user.id}&username=${user.username}&expires_at=${decoded.exp}`)

    });

}
