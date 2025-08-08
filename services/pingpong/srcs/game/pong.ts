import { WebSocketServer, WebSocket } from 'ws';

import { Ball } from './ball';
import { Paddle } from './paddle';
import { GameRoom } from './room';
import { config } from './pong.config';

const rooms: Record<string, GameRoom> = {};
const wss = new WebSocketServer({ port: 8080 });

function broadcastState(room: GameRoom): void {

    const state = {
        leftPaddleY: room.leftPaddle.getY(),
        rightPaddleY: room.rightPaddle.getY(),
        ballX: room.ball.getX(),
        ballY: room.ball.getY(),
        leftScore: room.leftPaddle.getScore(),
        rightScore: room.rightPaddle.getScore(),
        isGameOver: room.isGameOver,
        winningPlayer: room.winningPlayer
    };

    for (const client of room.players.keys()) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(state));
        }
    }

}

function collide(paddle: Paddle, ball: Ball): boolean {
    return (
        paddle.getX() < ball.getX() + ball.getWidth() &&
        paddle.getX() + paddle.getWidth() > ball.getX() &&
        paddle.getY() < ball.getY() + ball.getHeight() &&
        paddle.getY() + paddle.getHeight() > ball.getY()
    );
}

function resetBall(room: GameRoom): void {
    const ball = room.ball;
    ball.setX((config.screen.width + 2 * config.screen.sidebar_width) / 2);
    ball.setY(config.screen.height / 2);
    ball.setDx(config.ball_speed * (Math.random() < 0.5 ? 1 : -1));
    ball.setDy(config.ball_speed * (Math.random() < 0.5 ? 1 : -1));
}

function gameLoop(room: GameRoom): void {

    if (room.isGameOver) {
        return broadcastState(room);
    }

    const { leftPaddle, rightPaddle, ball } = room;

    leftPaddle.movePaddle1Frame();
    rightPaddle.movePaddle1Frame();

    const maxPaddleY = config.screen.height - config.screen.grid_size - config.paddle.height;

    if (leftPaddle.getY() < config.screen.grid_size) {
        leftPaddle.setY(config.screen.grid_size);
    }

    else if (leftPaddle.getY() > maxPaddleY) {
        leftPaddle.setY(maxPaddleY);
    }

    if (rightPaddle.getY() < config.screen.grid_size) {
        rightPaddle.setY(config.screen.grid_size);
    }

    else if (rightPaddle.getY() > maxPaddleY) {
        rightPaddle.setY(maxPaddleY);
    }

    ball.moveBall1Frame();

    if (ball.getY() < config.screen.grid_size || ball.getY() + config.screen.grid_size > config.screen.height - config.screen.grid_size) {
        ball.setDy(ball.getDy() * -1);
    }

    if (ball.getX() < config.screen.sidebar_width + config.screen.grid_size) {
        rightPaddle.addScore(1);
        resetBall(room);
    }
    
    else if (ball.getX() > config.screen.sidebar_width + config.screen.width - config.screen.grid_size) {
        leftPaddle.addScore(1);
        resetBall(room);
    }

    if (collide(leftPaddle, ball)) {
        ball.setDx(ball.getDx() * -1);
        ball.setX(leftPaddle.getX() + leftPaddle.getWidth());
    }
    
    else if (collide(rightPaddle, ball)) {
        ball.setDx(ball.getDx() * -1);
        ball.setX(rightPaddle.getX() - ball.getWidth());
    }

    if (leftPaddle.getScore() >= config.win_score) {
        room.isGameOver = true;
        room.winningPlayer = 'leftPlayer';
    }
    
    else if (rightPaddle.getScore() >= config.win_score) {
        room.isGameOver = true;
        room.winningPlayer = 'rightPlayer';
    }

    broadcastState(room);

}

export function deleteRoom(gid: string) {
    if (rooms[gid]) {
        clearInterval(rooms[gid].loop);
        delete rooms[gid];
    }
}

export function createRoom(gid: string): GameRoom {

    const room = {

        gid: gid,
        player1: null,
        player2: null,
        players: new Map(),

        leftPaddle: new Paddle(
            "leftPlayer",
            config.screen.grid_size,
            config.paddle.height,
            config.screen.sidebar_width + config.screen.grid_size * 2,
            config.screen.height / 2 - config.paddle.height / 2
        ),
        
        rightPaddle: new Paddle(
            "rightPlayer",
            config.screen.grid_size,
            config.paddle.height,
            config.screen.sidebar_width + config.screen.width - config.screen.grid_size * 2,
            config.screen.height / 2 - config.paddle.height / 2
        ),
        
        ball: new Ball(
            config.screen.grid_size,
            config.screen.grid_size,
            (config.screen.width + 2 * config.screen.sidebar_width) / 2,
            config.screen.height / 2,
            config.ball_speed,
            -config.ball_speed
        ),
        
        isGameOver: false,
        isGameReady: false,
        winningPlayer: undefined,
        loop: null!
    
    } as GameRoom;

    rooms[gid] = room;
    return room;

}

function joinRoom(ws: WebSocket, roomId: string): { room: GameRoom; playerId: 'player1' | 'player2' } | null {

    const room = rooms[roomId];
    
    if (!room) return null;

    if (!room.player1) {
        room.player1 = ws;
        room.players.set(ws, 'player1');
        return { room, playerId: 'player1' };
    }

    if (!room.player2) {

        room.player2 = ws;
        room.players.set(ws, 'player2');
        room.player1.send(JSON.stringify({ type: 'opponent_joined' }));
        room.player2.send(JSON.stringify({ type: 'waiting_for_host' }));

        return { room, playerId: 'player2' };
    
    }

    return null; // Room full

}

function handleInput(room: GameRoom, playerId: 'player1' | 'player2', key: string, isPressed: boolean): void {

    if (room.isGameOver) {
    
        if (key === 'Enter') {
            room.leftPaddle.setScore(0);
            room.rightPaddle.setScore(0);
            room.ball.setX((config.screen.width + 2 * config.screen.sidebar_width) / 2);
            room.ball.setY(config.screen.height / 2);
            room.isGameOver = false;
        }
    
        return;
    
    }

    const paddle = playerId === 'player1' ? room.leftPaddle : room.rightPaddle;
    
    if (playerId === 'player1') {
        if (key === "KeyW") paddle.setDy(isPressed ? -config.paddle.speed : 0);
        else if (key === "KeyS") paddle.setDy(isPressed ? config.paddle.speed : 0);
    }
    
    else {
        if (key === "ArrowUp") paddle.setDy(isPressed ? -config.paddle.speed : 0);
        else if (key === "ArrowDown") paddle.setDy(isPressed ? config.paddle.speed : 0);
    }

}

wss.on('connection', (ws) => {

    let joinedRoom: GameRoom | null = null;
    let playerId: 'player1' | 'player2' | null = null;

    ws.once('message', (message) => {

        const data = JSON.parse(message.toString());

        if (data.type === 'join' && typeof data.gid === 'string') {
        
            const result = joinRoom(ws, data.gid);

            if (!result) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room not found or full' }));
                ws.close();
                return;
            }

            joinedRoom = result.room;
            playerId = result.playerId;

            ws.send(JSON.stringify({ type: 'player_assignment', player: playerId, roomId: joinedRoom.gid }));
            console.log(`${playerId} joined room ${joinedRoom.gid}`);

            if (!joinedRoom.isGameReady) {
                ws.send(JSON.stringify({ type: 'waiting_for_player' }));
            }

            // Register input handler
            ws.on('message', (msg) => {
        
                const input = JSON.parse(msg.toString());

                if (input.type === 'start_game' && joinedRoom && playerId == 'player1') {

                    joinedRoom.isGameReady = true;
                    joinedRoom.loop = setInterval(() => gameLoop(joinedRoom!), 1000 / 60);
                
                    joinedRoom.players.forEach((_, client) => {
                        client.send(JSON.stringify({ type: 'game_start' }));
                    });
                
                }
        
                else if (input.type === 'input' && joinedRoom && playerId) {
                    handleInput(joinedRoom, playerId, input.key, input.pressed);
                }
        
            });

            ws.on('close', () => {
        
                console.log(`${playerId} disconnected from room ${joinedRoom!.gid}`);
        
                if (joinedRoom!.players.has(ws)) joinedRoom!.players.delete(ws);
                if (playerId === 'player1') joinedRoom!.player1 = null;
                if (playerId === 'player2') joinedRoom!.player2 = null;

                if (!joinedRoom!.player1 && !joinedRoom!.player2) {
                    deleteRoom(joinedRoom!.gid);
                    console.log(`Room ${joinedRoom!.gid} closed.`);
                }
        
            });
        
        }
        
        else {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid join request' }));
            ws.close();
        }
        
    });

});
