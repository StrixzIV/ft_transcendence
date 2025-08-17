const hostname = import.meta.env.VITE_DOMAIN_NAME;

export const auth_endpoint = (endpoint: String) => `https://${hostname}:8443/auth/${endpoint.replace('/', '')}`
export const users_endpoint = (endpoint: String) => `https://${hostname}:8443/user/${endpoint.replace('/', '')}`
export const game_endpoint = (endpoint: String) => `https://${hostname}:8443/game/${endpoint.replace('/', '')}`

export const websocket_endpoint = (endpoint: String) => `wss://${hostname}:8443/ws/${endpoint.replace('/', '')}`
