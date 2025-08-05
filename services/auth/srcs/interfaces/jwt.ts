export interface JWTSecret {
    access_secret: string,
    refresh_secret: string
}

export interface JWTInfo {
    id: string,
    iat: number,
    exp: number
}
