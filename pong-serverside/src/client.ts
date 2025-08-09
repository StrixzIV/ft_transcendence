// client.ts
import { Paddle, Ball } from "./pong_paddle_ball.js";

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
const CANVAS_HEIGHT = 800;
const SIDEBAR_WIDTH = 100;
const GRID_SIZE = 20;
const PADDLE_HEIGHT = 100;

class PongClient {
    
    private _canvas!: HTMLCanvasElement | null;
    private _context!: CanvasRenderingContext2D | null;

    private _canvasWidth!: number;
    private _cavnasHeight!: number;
    private _sidebarWidth!: number;
    private _gridSizeInPx!: number;

    private _leftPaddle: Paddle;
    private _rightPaddle: Paddle;
    private _ball: Ball;

    private _socket!: WebSocket;
    private _isGameOver: boolean = false;
    private _isGameStarted: boolean = false;
    private _opponentJoined: boolean = false;
    private _isWaitingForHost: boolean = false;
    private _assignedPlayerId: 'player1' | 'player2' | null = null;
    private _winningPlayer: 'leftPlayer' | 'rightPlayer' | undefined = undefined;

    constructor(gameWidth: number, sideWidth: number, cHeight: number, gridSize: number, private _gid: string) {

        this._gid = _gid;
    
        this.createCanvas(gameWidth, sideWidth, cHeight);
        this._gridSizeInPx = gridSize;
        this._sidebarWidth = sideWidth;
        this._cavnasHeight = cHeight;

        this.createPopup();

        this._leftPaddle = new Paddle("leftPlayer", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GRID_SIZE * 2, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this._rightPaddle = new Paddle("rightPlayer", GRID_SIZE, PADDLE_HEIGHT, SIDEBAR_WIDTH + GAME_WIDTH - GRID_SIZE * 2, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this._ball = new Ball(gridSize, gridSize, 0, 0, 0, 0);

        this.setupWebSocket();
        this.loadFont();
        this.setupEventListeners();
    
    }

    private createCanvas(gameWidth: number, sideWidth: number, cHeight: number): void {
        this._canvas = document.createElement("canvas");
        document.body.appendChild(this._canvas);

        this._canvasWidth = gameWidth + sideWidth * 2;
        this._canvas.width = this._canvasWidth;
        this._canvas.style.width = `${this._canvasWidth}px`;
        this._cavnasHeight = cHeight;
        this._canvas.height = cHeight;
        this._canvas.style.height = `${cHeight}px`;

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
        document.body.appendChild(popup);

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
        const myFont = new FontFace('pong-score', 'url(src/pong-score.otf.woff2)');
        myFont.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
        }).catch((error) => {
            console.error('Failed to load font:', error);
        });
    }

    private setupWebSocket(): void {

        // You'll need to run a server, e.g. `node server.js`
        this._socket = new WebSocket("ws://localhost:8080");

        this._socket.onopen = () => {

            console.log(`Connected to WebSocket server. Joining gid: ${this._gid}`);
            
            this._socket.send(JSON.stringify({
                type: "join",
                gid: this._gid
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

            case 'error':
                console.error("Server error:", gameState.message);
                break;

            default:

                if (this._isGameStarted) {
                    this.updateClientState(gameState);
                }

                break;

            }
        
        };

        this._socket.onclose = () => {
            console.log("Disconnected from WebSocket server.");
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

        if (this._opponentJoined) {
            this.showPopup("Opponent joined!", "Press Enter to start.");
        }

        else {
            this.showPopup(
                "Waiting for another player...",
                `Share this room ID with a friend: ${this._gid}`
            );
        }

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
        let cHeight = this._cavnasHeight;
        let gridSize = this._gridSizeInPx;

        // Clear canvas
        ctx.clearRect(0, 0, cWidth, cHeight);

        // Draw walls
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, cWidth, gridSize);
        ctx.fillRect(0, cHeight - gridSize, cWidth, cHeight);

        // Draw dotted line
        for (let i = gridSize; i < cHeight - gridSize; i += gridSize * 2) {
            ctx.fillRect(cWidth / 2 - gridSize / 2, i, gridSize, gridSize);
        }

        // Draw paddles and ball
        ctx.fillStyle = 'white';
        ctx.fillRect(this._leftPaddle.getX(), this._leftPaddle.getY(), this._leftPaddle.getWidth(), this._leftPaddle.getHeight());
        ctx.fillRect(this._rightPaddle.getX(), this._rightPaddle.getY(), this._rightPaddle.getWidth(), this._rightPaddle.getHeight());
        ctx.fillRect(this._ball.getX(), this._ball.getY(), this._ball.getWidth(), this._ball.getHeight());

        // Draw scores
        this.scoreboards();

        if (this._isGameOver) {
            this.drawGameOverScreen();
        }
    }

    private scoreboards(): void {
        let ctx = this._context!;
        let cWidth = this._canvasWidth;
        let sWidth = this._sidebarWidth;
        let gridSize = this._gridSizeInPx;

        ctx.font = `${sWidth / 2}px pong-score`;
        ctx.textAlign = "left";
        ctx.fillText(`${this._leftPaddle.getScore()}`, gridSize, gridSize * 5, sWidth - gridSize);
        ctx.textAlign = "right";
        ctx.fillText(`${this._rightPaddle.getScore()}`, cWidth, gridSize * 5, sWidth - gridSize);
    }
    
    private drawGameOverScreen(): void {
        let winnerMessage = this._winningPlayer === 'leftPlayer' ? 'Left Player Wins!' : 'Right Player Wins!';
        this.showPopup(winnerMessage, "Press Enter to exit");
    }
}

// Start the client
const gid = prompt("Enter Game ID:") ?? "";
new PongClient(1000, 100, 800, 20, gid);