import { GoogleSecret } from "../interfaces/google";
import { vault } from "./vault_client";

export async function get_google_secret(): Promise<GoogleSecret> {
    const result = await vault.read('secret/data/google');

    return {
        google_client_id: result.data.data.google_client_id,
        google_client_secret: result.data.data.google_client_secret
    } as GoogleSecret;
}
