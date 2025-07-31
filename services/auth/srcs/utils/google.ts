import { vault } from "./vault_client";

export interface GoogleSecret {
    google_client_id: string,
    google_client_secret: string
}

export async function get_google_secret(): Promise<GoogleSecret> {
    const result = await vault.read('secret/data/google');

    return {
        google_client_id: result.data.data.google_client_id,
        google_client_secret: result.data.data.google_client_secret
    } as GoogleSecret;
}
