// client.ts
import { navigate } from "../router";
import { Paddle, Ball } from "./pong_paddle_ball";
import scoreFontUrl from './Pixel-UniCode.ttf?url';

import type { User } from "../interfaces/user";

import { secureFetch } from "../utils/secureFetch";
import { users_endpoint, websocket_endpoint } from "../provider/api";

interface GameState {
    leftPaddleY: number;
    rightPaddleY: number;
    ballX: number;
    ballY: number;
    leftScore: number;
    rightScore: number;
    isGameOver: boolean;
    isGameStarted: boolean;
    winningPlayer?: 'leftPlayer' | 'rightPlayer';
}

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 800;
const SIDEBAR_WIDTH = 0;
const TOPBAR_HEIGHT = 100;
const GRID_SIZE = 20;
const PADDLE_HEIGHT = 100;

class PongClient {
    
    private _gid!: string;

    private _canvas!: HTMLCanvasElement | null;
    private _context!: CanvasRenderingContext2D | null;

    private _canvasWidth!: number;
    private _canvasHeight!: number;
    
    private _topbarHeight!: number;

    private _gridSizeInPx!: number;

    private _leftPaddle: Paddle;
    private _rightPaddle: Paddle;
    private _ball: Ball;

    private _socket!: WebSocket;
    private _isGameOver: boolean = false;
    private _isGameStarted: boolean = false;
    private _opponentJoined: boolean = false;
    private _isWaitingForHost: boolean = false;
    private _username: string | null = null;
    private _assignedPlayerId: 'player1' | 'player2' | null = null;
    private _winningPlayer: string | undefined = undefined;

    constructor(gameWidth: number, sideWidth: number, gameHeight: number, topbarHeight: number, gridSize: number, _gid: string, username: string) {

        this._gid = _gid;
        this._username = username
    
        this.createCanvas(gameWidth, sideWidth, gameHeight, topbarHeight);
        this._gridSizeInPx = gridSize;
        this._topbarHeight = topbarHeight;

        this.createPopup();

        this._leftPaddle = new Paddle("Host", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GRID_SIZE, GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this._rightPaddle = new Paddle("Guest", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GAME_WIDTH - GRID_SIZE * 2, GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this._ball = new Ball(gridSize, gridSize, 0, 0, 0, 0);

        this.setupWebSocket();
        this.loadFont();
        this.setupEventListeners();
    
    }

    private createCanvas(gameWidth: number, sideWidth: number, gameHeight: number, topbarHeight: number): void {
        this._canvas = document.createElement("canvas");
        document.querySelector<HTMLDivElement>('#app')!.appendChild(this._canvas);

        this._canvasWidth = gameWidth + sideWidth * 2;
        this._canvas.width = this._canvasWidth;
        this._canvas.style.width = `${this._canvasWidth}px`;
        this._canvasHeight = gameHeight + topbarHeight;
        this._canvas.height = this._canvasHeight;
        this._canvas.style.height = `${this._canvasHeight}px`;

        this._canvas.style.display = "block";
        this._canvas.style.margin = "auto";

        this._context = this._canvas.getContext('2d')!;
        if (!this._context) {
            console.error("Failed to get 2D context.");
        }
    }

    private createPopup(): void {

        const popup = document.createElement("div");
        popup.id = "popup-overlay";

        Object.assign(popup.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            zIndex: "1000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            visibility: "hidden"
        });

        const title = document.createElement("h1");
        title.id = "popup-title";

        const message = document.createElement("p");
        message.id = "popup-message";

        popup.appendChild(title);
        popup.appendChild(message);
        document.querySelector<HTMLDivElement>('#app')!.appendChild(popup);

    }

    private showPopup(title: string, message: string) {

        const popup = document.getElementById("popup-overlay") as HTMLDivElement;
        const titleEl = document.getElementById("popup-title") as HTMLHeadingElement;
        const msgEl = document.getElementById("popup-message") as HTMLParagraphElement;

        if (popup && titleEl && msgEl) {
            titleEl.textContent = title;
            msgEl.textContent = message;
            popup.style.visibility = "visible";
        }

    }

    private hidePopup() {
        const popup = document.getElementById("popup-overlay") as HTMLDivElement;
        if (popup) popup.style.visibility = "hidden";
    }

    private setupEventListeners(): void {

        document.addEventListener('keydown', (event: KeyboardEvent) => {

            // Send a new 'start_game' message to the server
            if (event.code === 'Enter' && this._opponentJoined && !this._isGameStarted) {
                if (this._socket.readyState === WebSocket.OPEN) {
                    this._socket.send(JSON.stringify({ type: 'start_game' }));
                }
            }
            
            // Reload on game over
            if (event.code === 'Enter' && this._isGameOver) {
                if (this._socket.readyState === WebSocket.OPEN) {
                    window.location.reload();
                }
            }

            this.sendInput(event.code, true);

        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.sendInput(event.code, false);
        });

    }

    private loadFont(): void {
        const myFont = new FontFace('pong-score', `url(${scoreFontUrl}) format('truetype')`);
        myFont.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
        }).catch((error) => {
            console.error('Failed to load font:', error);
        });
    }

    private setupWebSocket(): void {

        this._socket = new WebSocket(websocket_endpoint('/game'));

        this._socket.onopen = () => {

            console.log(`Connected to WebSocket server. Joining gid: ${this._gid}`);
            
            this._socket.send(JSON.stringify({
                type: "join",
                gid: this._gid,
                uid: localStorage.getItem('uid'),
                username: this._username
            }));
            
            console.log(`Current gid: ${this._gid}`);

        };

        this._socket.onmessage = (event) => {
            
            const gameState = JSON.parse(event.data);
        
            switch (gameState.type) {

            case 'player_assignment':
                this._assignedPlayerId = gameState.player;
                console.log(`Assigned as ${this._assignedPlayerId}`);
                this.drawGame();
                break;
            
            case 'waiting_for_player':
                this._isGameStarted = false;
                this._isGameOver = false;
                this._opponentJoined = false;
                this._isWaitingForHost = false;
                this.drawWaitingScreen();
                break;

            case 'opponent_joined':
                this._opponentJoined = true;
                this._isWaitingForHost = false;
                this._isGameStarted = false;
                this._isGameOver = false;
                this.drawWaitingScreen();
                break;

            case 'waiting_for_host':
                this._isWaitingForHost = true;
                this._opponentJoined = false;
                this._isGameStarted = false;
                this._isGameOver = false;
                this.drawWaitingForHostScreen();
                break;

            case 'game_start':
                this._isGameStarted = true;
                this._isGameOver = false;
                this._opponentJoined = false;
                this._isWaitingForHost = false;
                this.hidePopup();
                console.log("Game is starting!");
                break;

            case 'rejoin_success':
                this._assignedPlayerId = gameState.player;
                this._isGameStarted = true;
                console.log(`Rejoined as ${this._assignedPlayerId}`);
                this.hidePopup();
                break;

            case 'error':
                console.error("Server error:", gameState.message);
                break;

            default:

                if (this._isGameStarted || gameState.isGameReady) {
                    this.updateClientState(gameState);
                }

                break;

            }
        
        };

        this._socket.onclose = async () => {
            console.log("Disconnected from WebSocket server.");
            await navigate('/');
        };

        this._socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

    }

    private sendInput(keyCode: string, isPressed: boolean): void {
        if (this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify({ type: "input", key: keyCode, pressed: isPressed }));
        }
    }

    private updateClientState(gameState: GameState): void {
        this._leftPaddle.setY(gameState.leftPaddleY);
        this._rightPaddle.setY(gameState.rightPaddleY);
        this._ball.setX(gameState.ballX);
        this._ball.setY(gameState.ballY);
        this._leftPaddle.setScore(gameState.leftScore);
        this._rightPaddle.setScore(gameState.rightScore);
        this._isGameOver = gameState.isGameOver;
        this._winningPlayer = gameState.winningPlayer;
        this.drawGame();
    }

    private drawWaitingScreen(): void {

        if (this._isWaitingForHost) {
            this.showPopup("Waiting for host to start...", "");
        }
        
        else if (!this._opponentJoined) {
            this.showPopup(
              "Waiting for another player...",
              `Share this room ID with a friend: ${this._gid}`
            );
        }
        
        else {
            this.showPopup("Opponent joined!", "Press Enter to start.");
        }

        this.drawGame();

    }

    private drawWaitingForHostScreen(): void {
        this.showPopup("Waiting for host to start...", "");
    }
    
    private drawGame(): void {

        if (!this._isGameStarted) {
            return;
        }

        let ctx = this._context!;
        let cWidth = this._canvasWidth;
        let cHeight = this._canvasHeight;
        let gridSize = this._gridSizeInPx;

        let topHeight = this._topbarHeight;

        let ball = this._ball;
        let leftPaddle = this._leftPaddle;
        let rightPaddle = this._rightPaddle;

        // Clear canvas
        ctx.clearRect(0, 0, cWidth, cHeight);

        // Draw walls
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, topHeight, cWidth, gridSize);
        ctx.fillRect(0, cHeight - gridSize, cWidth, gridSize);

        // Draw dotted line
        for (let i = gridSize; i < cHeight - gridSize; i += gridSize * 2) {
            ctx.fillRect(cWidth / 2 - gridSize / 2, i, gridSize, gridSize);
        }

        // Draw paddles and ball
        ctx.fillStyle = 'white';
        ctx.fillRect(leftPaddle.getX(), leftPaddle.getY() + topHeight, leftPaddle.getWidth(), leftPaddle.getHeight());
        ctx.fillRect(rightPaddle.getX(), rightPaddle.getY() + topHeight, rightPaddle.getWidth(), rightPaddle.getHeight());
        ctx.fillRect(ball.getX(), ball.getY() + topHeight, ball.getWidth(), ball.getHeight());

        // Draw scores
        this.scoreboards();

        if (this._isGameOver) {
            this.drawGameOverScreen();
        }
    }

    private scoreboards(): void {
        let ctx = this._context!;
        let cWidth = this._canvasWidth;
        let topHeight = this._topbarHeight;
        let gridSize = this._gridSizeInPx;
        let lPaddle = this._leftPaddle;
        let rPaddle = this._rightPaddle;

        ctx.font = `${topHeight * 4 / 5}px pong-score`;
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(`${lPaddle.getScore()}    ${lPaddle.getPlayerId()}`, gridSize, topHeight * 4 / 5, cWidth / 2 - gridSize * 2);
        ctx.textAlign = "right";
        ctx.fillText(`${rPaddle.getPlayerId()}    ${rPaddle.getScore()}`, cWidth - gridSize , topHeight * 4 / 5, cWidth / 2 - gridSize * 2);
    }
    
    private drawGameOverScreen(): void {
        this.showPopup(`${this._winningPlayer} wins!`, "Press Enter to exit");
    }
}

// Start the client
export async function loadRemoteGame() {

    document.querySelector<HTMLDivElement>('#app')!.innerHTML = "";
    
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("gid");
    
    if (!gid) {
        await navigate('/');
        return;
    }

    const user = await secureFetch(users_endpoint("/data"), {
        method: 'GET'
    });

    const userData = await user.json() as User;

    new PongClient(GAME_WIDTH, SIDEBAR_WIDTH, GAME_HEIGHT, TOPBAR_HEIGHT, GRID_SIZE, gid, userData.username);

}