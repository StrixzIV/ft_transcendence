import qrcode from "qrcode";
import speakeasy from "speakeasy";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../db";

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
    
    app.post('/2fa/verify', { preHandler: [app.authenticate] }, async (request, response) => {

        const uid = (request.user as { id: string }).id
        const { token } = request.body as { token: string }

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

        return { valid }

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