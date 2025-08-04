// server.ts
import { WebSocketServer, WebSocket } from 'ws';
import { Paddle, Ball } from './pong_paddle_ball.js';

interface PlayerInput {
    type: 'input';
    key: string;
    pressed: boolean;
}

// Game settings
const GAME_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
const SIDEBAR_WIDTH = 100;
const GRID_SIZE = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 8;
const BALL_SPEED = 6;
const WIN_SCORE = 5;

// Game state
let leftPaddle: Paddle;
let rightPaddle: Paddle;
let ball: Ball;
let isGameOver: boolean = true;
let winningPlayer: 'leftPlayer' | 'rightPlayer' | undefined = undefined;

// Player connections
let player1: WebSocket | null = null;
let player2: WebSocket | null = null;
const connectedClients = new Map<WebSocket, 'player1' | 'player2'>();

function initializeGameState(): void {
    leftPaddle = new Paddle("leftPlayer", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GRID_SIZE * 2, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    rightPaddle = new Paddle("rightPlayer", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GAME_WIDTH - GRID_SIZE * 2, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    ball = new Ball(GRID_SIZE, GRID_SIZE, (GAME_WIDTH + 2 * SIDEBAR_WIDTH) / 2, CANVAS_HEIGHT / 2, BALL_SPEED, -BALL_SPEED);
    isGameOver = false;
    winningPlayer = undefined;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected.');
    
    if (!player1) {
        player1 = ws;
        connectedClients.set(ws, 'player1');
        ws.send(JSON.stringify({ type: 'player_assignment', player: 'player1' }));
        if (player2) {
            initializeGameState();
        }
    } else if (!player2) {
        player2 = ws;
        connectedClients.set(ws, 'player2');
        ws.send(JSON.stringify({ type: 'player_assignment', player: 'player2' }));
        // Start the game when the second player connects
        initializeGameState();
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full.' }));
        ws.close();
        return;
    }

    ws.on('message', message => {
        const data: PlayerInput = JSON.parse(message.toString());
        if (data.type === 'input') {
            const playerId = connectedClients.get(ws);
            if (playerId) {
                handleInput(playerId, data.key, data.pressed);
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        if (connectedClients.get(ws) === 'player1') {
            player1 = null;
        } else if (connectedClients.get(ws) === 'player2') {
            player2 = null;
        }
        connectedClients.delete(ws);
    });
});

function handleInput(playerId: 'player1' | 'player2', key: string, isPressed: boolean): void {
    if (isGameOver) {
        // Allow a keypress to restart the game
        if (key === 'Enter') {
            initializeGameState();
        }
        return;
    }

    const paddle = playerId === 'player1' ? leftPaddle : rightPaddle;
    
    if (playerId === 'player1') {
        if (key === "KeyW") {
            paddle.setDy(isPressed ? -PADDLE_SPEED : 0);
        } else if (key === "KeyS") {
            paddle.setDy(isPressed ? PADDLE_SPEED : 0);
        }
    } else if (playerId === 'player2') {
        if (key === "ArrowUp") {
            paddle.setDy(isPressed ? -PADDLE_SPEED : 0);
        } else if (key === "ArrowDown") {
            paddle.setDy(isPressed ? PADDLE_SPEED : 0);
        }
    }
}

const gameLoop = () => {
    if (isGameOver) {
        // Still send game state to display game over screen
        const gameState = {
            leftPaddleY: leftPaddle.getY(),
            rightPaddleY: rightPaddle.getY(),
            ballX: ball.getX(),
            ballY: ball.getY(),
            leftScore: leftPaddle.getScore(),
            rightScore: rightPaddle.getScore(),
            isGameOver: isGameOver,
            winningPlayer: winningPlayer
        };
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(gameState));
            }
        });
        return;
    }

    // Move paddles
    leftPaddle.movePaddle1Frame();
    rightPaddle.movePaddle1Frame();
    
    const maxPaddleY = CANVAS_HEIGHT - GRID_SIZE - PADDLE_HEIGHT;
    if (leftPaddle.getY() < GRID_SIZE) leftPaddle.setY(GRID_SIZE);
    else if (leftPaddle.getY() > maxPaddleY) leftPaddle.setY(maxPaddleY);
    if (rightPaddle.getY() < GRID_SIZE) rightPaddle.setY(GRID_SIZE);
    else if (rightPaddle.getY() > maxPaddleY) rightPaddle.setY(maxPaddleY);

    // Move ball
    ball.moveBall1Frame();

    // Wall collision
    if (ball.getY() < GRID_SIZE || ball.getY() + GRID_SIZE > CANVAS_HEIGHT - GRID_SIZE) {
        ball.setDy(ball.getDy() * -1);
    }

    // Scoring logic
    if (ball.getX() < SIDEBAR_WIDTH + GRID_SIZE) {
        rightPaddle.addScore(1);
        resetBall();
    } else if (ball.getX() > SIDEBAR_WIDTH + GAME_WIDTH - GRID_SIZE) {
        leftPaddle.addScore(1);
        resetBall();
    }
    
    // Paddle collision
    if (collide(leftPaddle, ball)) {
        ball.setDx(ball.getDx() * -1);
        ball.setX(leftPaddle.getX() + leftPaddle.getWidth());
    } else if (collide(rightPaddle, ball)) {
        ball.setDx(ball.getDx() * -1);
        ball.setX(rightPaddle.getX() - ball.getWidth());
    }

    // Check for game over condition
    if (leftPaddle.getScore() >= WIN_SCORE) {
        isGameOver = true;
        winningPlayer = 'leftPlayer';
    } else if (rightPaddle.getScore() >= WIN_SCORE) {
        isGameOver = true;
        winningPlayer = 'rightPlayer';
    }

    // Build and send the game state to all connected clients
    const gameState = {
        leftPaddleY: leftPaddle.getY(),
        rightPaddleY: rightPaddle.getY(),
        ballX: ball.getX(),
        ballY: ball.getY(),
        leftScore: leftPaddle.getScore(),
        rightScore: rightPaddle.getScore(),
        isGameOver: isGameOver,
        winningPlayer: winningPlayer
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameState));
        }
    });
};

function collide(paddle: Paddle, ball: Ball): boolean {
    return (
        paddle.getX() < ball.getX() + ball.getWidth() &&
        paddle.getX() + paddle.getWidth() > ball.getX() &&
        paddle.getY() < ball.getY() + ball.getHeight() &&
        paddle.getY() + paddle.getHeight() > ball.getY()
    );
}

function resetBall(): void {
    ball.setX((GAME_WIDTH + 2 * SIDEBAR_WIDTH) / 2);
    ball.setY(CANVAS_HEIGHT / 2);
    ball.setDx(BALL_SPEED * (Math.random() < 0.5 ? 1 : -1)); // Randomize initial direction
    ball.setDy(BALL_SPEED * (Math.random() < 0.5 ? 1 : -1));
}

// Run the game loop at 60 frames per second
initializeGameState();
setInterval(gameLoop, 1000 / 60);

console.log('Pong server started on ws://localhost:8080');
