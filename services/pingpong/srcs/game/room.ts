import type { WebSocket } from 'ws';

import { Ball } from './ball';
import { Paddle } from './paddle';

export interface GameRoom {
    gid: string;
    player1: WebSocket | null;
    player2: WebSocket | null;
    players: Map<WebSocket, 'player1' | 'player2'>;
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    ball: Ball;
    isGameOver: boolean;
    isGameReady: boolean;
    winningPlayer: 'leftPlayer' | 'rightPlayer' | undefined;
    loop: NodeJS.Timeout;
}
