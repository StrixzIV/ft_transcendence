import bcrypt from 'bcrypt';
import jwtLib from 'jsonwebtoken';

import qrcode from "qrcode";
import speakeasy from "speakeasy";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../db";
import { get_JWT_secret } from '../utils/jwt';
import { decrypt, encrypt } from '../utils/encryption';
import { JWTInfo } from '../interfaces/jwt';
import { disable_schema, enable_schema, generate_schema, verify_schema } from '../schema/twofa_schema';

export async function twoFactorRoute(app: FastifyInstance, options: FastifyPluginOptions) {
    app.post('/2fa/generate', { schema: generate_schema }, async (request, response) => {
        // auth logic
        const access_token = request.cookies['access_token'];

        if (!access_token) {
            return response.code(401).send({ error: "Missing access token" });
        }

        let decoded: JWTInfo;

        try {
            decoded = app.jwt.verify(access_token) as JWTInfo;
        }
        catch (err) {
            return response.code(401).send({ error: "Invalid or expired access token" });
        }

        const uid = decoded.id;
        const user = await prisma.users.findUnique({
            where: { id: uid },
        });

        if (!user) {
            return response.code(401).send({ error: "User doesn't exist" });
        }

        // main logic
        if (user.totp_encerypted_secret) {
            const decrypt_totp_secret = await decrypt(user.totp_encerypted_secret);
            const otpauth_url = speakeasy.otpauthURL({
                secret: decrypt_totp_secret,
                label: `ft_transcendence: ${user.username}`,
                encoding: 'base32'
            });

            const qr_data_url = await qrcode.toDataURL(otpauth_url);

            return response.code(200).send({
                qr_data_url,
                totp_token: decrypt_totp_secret,
            });
        }

        const secret = speakeasy.generateSecret({
            name: `ft_transendence: ${user.username}`
        });
        const encrypted_totp_secret = await encrypt(secret.base32);

        await prisma.users.update({
            where: { id: uid },
            data: { totp_encerypted_secret: encrypted_totp_secret }
        });

        if (secret.otpauth_url == null) {
            return response.code(500).send({ error: "Failed to generate 2FA QRCode" });
        }

        const qr_data_url = await qrcode.toDataURL(secret.otpauth_url);

        return { qr_data_url, totp_token: secret.base32 };
    });

    app.post('/2fa/enable', { schema: enable_schema }, async (request, response) => {
        // auth logic
        const access_token = request.cookies['access_token'];

        if (!access_token) {
            return response.code(401).send({ error: "Missing access token" });
        }

        let decoded: JWTInfo;

        try {
            decoded = app.jwt.verify(access_token) as JWTInfo
        }
        catch (err) {
            return response.code(401).send({ error: "Invalid or expired access token" })
        }

        const uid = decoded.id;
        const user = await prisma.users.findUnique({
            where: { id: uid },
        });

        if (!user) {
            return response.code(401).send({ error: "User doesn't exist" });
        }

        // main logic
        if (!user.totp_encerypted_secret) {
            return response.code(409).send({ error: "Please, Generate 2FA QRCode before click enable" });
        }

        await prisma.users.update({
            where: { id: uid },
            data: { twofa_enable: true }
        });

        return response.code(200).send();
    });

    app.post('/2fa/disable', { schema: disable_schema },async (request, response) => {
        // auth logic
        const access_token = request.cookies['access_token'];

        if (!access_token) {
            return response.code(401).send({ error: "Missing access token" });
        }

        let decoded: JWTInfo;

        try {
            decoded = app.jwt.verify(access_token) as JWTInfo;
        }
        catch (err) {
            return response.code(401).send({ error: "Invalid or expired access token" })
        }

        const uid = decoded.id;
        const user = await prisma.users.findUnique({
            where: { id: uid },
        });

        if (!user) {
            return response.code(401).send({ error: "User doesn't exist" });
        }

        // main logic
        await prisma.users.update({
            where: { id: uid },
            data: { totp_encerypted_secret: null, twofa_enable: false }
        });

        return response.code(200).send();
    });

    app.post('/2fa/verify', { schema: verify_schema },async (request, response) => {
        const { token, id } = request.body as { token: string, id: string };

        const user = await prisma.users.findUnique({
            where: { id: id },
        });

        if (!user) {
            return response.code(401).send({ error: "User doesn't exist" });
        }

        if (!user.totp_encerypted_secret || !user.twofa_enable) {
            return response.code(409).send({ error: "2FA not enabled" });
        }

        const decrypted_totp_secret = await decrypt(user.totp_encerypted_secret);
        const valid = speakeasy.totp.verify({
            secret: decrypted_totp_secret,
            encoding: "base32",
            token,
            window: 1
        });

        if (!valid) {
            return { valid };
        }

        const secrets = await get_JWT_secret();
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
        const decoded = app.jwt.decode(raw_refresh_token) as { iat: number, exp: number };

        if (!decoded) {
            return response.code(500).send({ error: 'Cannot generate login credential' });
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
    });
}