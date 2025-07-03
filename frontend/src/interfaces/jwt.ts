export interface JWTMetadata {
    id: string;
    username: string;
    email?: string;
    exp: number;
}
