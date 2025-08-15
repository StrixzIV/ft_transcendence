import type { WebSocket } from 'ws';

import { Ball } from './ball';
import { Paddle } from './paddle';

export interface PlayerInfo {
    playerId: 'player1' | 'player2';
    uid: string;
    username: string;
}

export interface PlayerState {
    ws: WebSocket | null;
    playerId: 'player1' | 'player2';
    uid: string;
    username: string;
}

export interface GameRoom {
    gid: string;
    player1: WebSocket | null;
    player2: WebSocket | null;
    players: Map<WebSocket, PlayerInfo>;
    playersState: Map<string, PlayerState>;
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    ball: Ball;
    isGameOver: boolean;
    isGameReady: boolean;
    winningPlayer: string | undefined;
    winningUID: string | undefined;
    loop: NodeJS.Timeout;
}
