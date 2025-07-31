import { vault } from "./vault_client";

export interface JWTSecret {
    access_secret: string,
    refresh_secret: string
}

export async function get_JWT_secret(): Promise<JWTSecret> {
    const result = await vault.read('secret/data/jwt');

    return {
        access_secret: result.data.data.access_secret,
        refresh_secret: result.data.data.refresh_secret
    } as JWTSecret;
}
