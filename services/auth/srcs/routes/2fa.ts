import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import qrcode from "qrcode";
import speakeasy from "speakeasy";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../db";
import { get_JWT_secret } from '../utils/jwt';

export async function twoFactorRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    
    app.post('/2fa/enable', { preHandler: [app.authenticate] }, async (request, response) => {

        const uid = (request.user as { id: string }).id

        const user = await prisma.users.findUnique({
            where: { id: uid },
        })

        if (!user) {
            return response.code(400).send({ error: "User not found" })
        }

        const secret = speakeasy.generateSecret({
            name: `ft_transendence: ${user.username}`
        })

        await prisma.users.update({
            where: { id: uid },
            data: { totp_secret: secret.base32 }
        })

        if (secret.otpauth_url == null) {
            return response.code(500).send({ error: "Failed to generate 2FA QRCode" })
        }

        const qr_data_url = await qrcode.toDataURL(secret.otpauth_url)

        return { qr_data_url, base32: secret.base32 }

    })

    app.post('/2fa/verify', async (request, response) => {

        const { token, uid } = request.body as { token: string, uid: string }

        const user = await prisma.users.findUnique({
            where: { id: uid },
        })

        if (!user) {
            return response.code(400).send({ error: "User not found" })
        }

        if (!user.totp_secret) {
            return response.code(400).send({ error: "2FA not enabled" })
        }

        const valid = speakeasy.totp.verify({
            secret: user.totp_secret,
            encoding: "base32",
            token,
            window: 1
        })

        if (!valid) {
            return { valid }
        }

        const secrets = await get_JWT_secret()
        
        const access_token = app.jwt.sign({
            id: user.id,
            username: user.username
        });

        const raw_refresh_token = jwtLib.sign(
            { id: user.id },
            secrets.refresh_secret,
            { expiresIn: '30d' }
        );
        
        const hashed_refresh_token = await bcrypt.hash(raw_refresh_token, 10);
        const decoded = app.jwt.decode(raw_refresh_token) as { iat: number, exp: number }

        if (!decoded) {
            return response.code(500).send({ error: 'Cannot get iat field from JWT' });
        }

        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token_hash: hashed_refresh_token,
                created_at: new Date(decoded.iat * 1000),
                expires_at: new Date(decoded.exp * 1000),
            }
        });

        response.setCookie('access_token', access_token, {
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

        return response.code(200).send({
            user: {
                id: user.id,
                username: user.username,
                mail: user.email
            },
            expires_at: decoded.exp,
            valid: true
        });

    })

    app.post('/2fa/disable', { preHandler: [app.authenticate] }, async (request, response) => {

        const uid = (request.user as { id: string }).id

        await prisma.users.update({
            where: { id: uid },
            data: { totp_secret: null }
        })

        return { success: true }

    })

}