import { vault } from "./vault_client";

export interface JWTSecret {
    access_secret: string,
    refresh_secret: string
}

let jwt_secret: JWTSecret | null = null;

export async function get_JWT_secret(): Promise<JWTSecret> {
    if (jwt_secret) {
        return jwt_secret;
    }

    const result = await vault.read('secret/data/jwt');

    jwt_secret = {
        access_secret: result.data.data.access_secret,
        refresh_secret: result.data.data.refresh_secret
    } as JWTSecret;

    return jwt_secret;
}
