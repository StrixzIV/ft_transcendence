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
    private _isGameOver: boolean = true;
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

    private setupEventListeners(): void {

        document.addEventListener('keydown', (event: KeyboardEvent) => {

            // Send a new 'start_game' message to the server
            if (event.code === 'Enter' && this._opponentJoined && !this._isGameStarted) {
                if (this._socket.readyState === WebSocket.OPEN) {
                    this._socket.send(JSON.stringify({ type: 'start_game' }));
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

        let ctx = this._context!;
        let cWidth = this._canvasWidth;
        let cHeight = this._cavnasHeight;

        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cWidth, cHeight);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for another player...', cWidth / 2, cHeight / 2 - 50);
        
        if (this._opponentJoined) {

            ctx.clearRect(0, 0, cWidth, cHeight);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, cWidth, cHeight);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText('Opponent joined! Press Enter to start.', cWidth / 2, cHeight / 2 - 50);

        }
        
        else {
            ctx.fillText('Waiting for another player...', cWidth / 2, cHeight / 2 - 50);
            ctx.font = '20px Arial';
            ctx.fillText(`Share this room ID with a friend: ${this._gid}`, cWidth / 2, cHeight / 2 + 20);
        }

    }

    private drawWaitingForHostScreen(): void {

        let ctx = this._context!;
        let cWidth = this._canvasWidth;
        let cHeight = this._cavnasHeight;

        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cWidth, cHeight);

        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for host to start...', cWidth / 2, cHeight / 2 - 50);
    
    }
    
    private drawGame(): void {

        if (!this._isGameStarted && !this._isGameOver && this._isWaitingForHost) {
            this.drawWaitingForHostScreen();
            return;
        }

        if (!this._isGameStarted && !this._isGameOver && this._assignedPlayerId === 'player1') {
            this.drawWaitingScreen();
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
new PongClient(1000, 100, 800, 20, "bd01eac8-97c0-4874-b512-bb80a23012be");