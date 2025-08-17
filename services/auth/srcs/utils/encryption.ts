import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { vault } from './vault_client';

// Algorithm (update these values = must update whole database)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// secret key
let priv_secret_key: string | null = null;

export async function get_encrypt_secret(): Promise<string> {
    if (priv_secret_key) {
        return priv_secret_key;
    }

    // get secret
    const result = await vault.read('secret/data/auth');

    // extract secret
    priv_secret_key = result.data.data.totp_encrytion_secret!;

    return priv_secret_key!;
}

export async function encrypt(raw: string): Promise<string> {
    const secret = await get_encrypt_secret();

    // encrypt stuff
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, secret, iv);

    const encrypted = Buffer.concat([
        cipher.update(raw, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

export async function decrypt(encryptedData: string): Promise<string> {
    const secret = await get_encrypt_secret();

    // decrypt stuff
    const raw = Buffer.from(encryptedData, 'base64');
    const iv = raw.slice(0, IV_LENGTH);
    const authTag = raw.slice(raw.length - 16);
    const encrypted = raw.slice(IV_LENGTH, raw.length - 16);
    const decipher = createDecipheriv(ALGORITHM, secret, iv).setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}
