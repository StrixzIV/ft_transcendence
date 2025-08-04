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
    winningPlayer?: 'leftPlayer' | 'rightPlayer';
}

class PongClient {
    private _canvas!: HTMLCanvasElement | null;
    private _context!: CanvasRenderingContext2D | null;

    private _canvasWidth!: number;
    private _cavnasHeight!: number;
    private _gameWidth!: number;
    private _sidebarWidth!: number;
    private _gridSizeInPx!: number;

    private _leftPaddle: Paddle;
    private _rightPaddle: Paddle;
    private _ball: Ball;

    private _socket!: WebSocket;
    private _isGameOver: boolean = true;
    private _winningPlayer: 'leftPlayer' | 'rightPlayer' | undefined = undefined;

    constructor(gameWidth: number, sideWidth: number, cHeight: number, gridSize: number, paddleHeight: number) {
        this._gridSizeInPx = gridSize;
        this._gameWidth = gameWidth;
        this._sidebarWidth = sideWidth;
        this._cavnasHeight = cHeight;

        this._leftPaddle = new Paddle("leftPlayer", gridSize, paddleHeight, 0, 0);
        this._rightPaddle = new Paddle("rightPlayer", gridSize, paddleHeight, 0, 0);
        this._ball = new Ball(gridSize, gridSize, 0, 0, 0, 0);

        this.createCanvas(this._gameWidth, sideWidth, cHeight);
        this.setupWebSocket();
        this.loadFont();
        this.setupEventListeners();
    }

    private createCanvas(gameWidth: number, sideWidth: number, cHeight: number): void {
        this._canvas = document.createElement("canvas");
        if (!this._canvas) {
            console.error("Failed to create canvas.")
        }
        
        document.body.appendChild(this._canvas);

        this._canvasWidth = gameWidth + sideWidth * 2;
        this._canvas.width = this._canvasWidth;
        this._canvas.style.width = `${this._canvasWidth}px`;
        this._cavnasHeight = cHeight;
        this._canvas.height = cHeight;
        this._canvas.style.height = `${cHeight}px`;

        this._context = this._canvas.getContext('2d')!;
        if (!this._context) {
            console.error("Failed to get 2D context for canvas.");
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
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
        // Need to run a server, e.g. `node server.js`
        this._socket = new WebSocket("ws://localhost:8080");

        this._socket.onopen = () => {
            console.log("Connected to WebSocket server.");
        };

        this._socket.onmessage = (event) => {
            const gameState: GameState = JSON.parse(event.data);
            this.updateClientState(gameState);
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
    
    private drawGame(): void {
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
        let ctx = this._context!;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this._canvasWidth, this._cavnasHeight);
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        
        let winnerMessage = this._winningPlayer === 'leftPlayer' ? 'Left Player Wins!' : 'Right Player Wins!';
        ctx.fillText(winnerMessage, this._canvasWidth / 2, this._cavnasHeight / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Press Enter to Play Again', this._canvasWidth / 2, this._cavnasHeight / 2 + 20);
    }
}

// Start the client
new PongClient(1000, 100, 800, 20, 100);
