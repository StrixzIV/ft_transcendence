import { vault } from "./vault_client";

export async function get_JWT_secret(): Promise<string> {
    const result = await vault.read('secret/data/jwt');
    return result.data.data.jwt_secret;
}
