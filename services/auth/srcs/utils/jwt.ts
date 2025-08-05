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

    // get secrets
    const result = await vault.read('secret/data/jwt');
    const access = result.data.data.access_secret!;
    const refresh = result.data.data.refresh_secret!;

    jwt_secret = {
        access_secret: access,
        refresh_secret: refresh
    } as JWTSecret;

    return jwt_secret;
}
