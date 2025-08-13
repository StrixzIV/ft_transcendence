import { Paddle, Ball } from "./pong_paddle_ball";
import scoreFontUrl from './Pixel-UniCode.ttf?url';

class Pong {

    private _canvas!: HTMLCanvasElement | null;
    private _context!: CanvasRenderingContext2D | null;

    private _canvasWidth!: number;
    private _canvasHeight!: number;
    
    private _gameWidth!: number;
    private _sidebarWidth!: number;

    private _gameHeight!: number;
    private _topbarHeight!: number;

    private _gridSizeInPx!: number;
    private _maxPaddleY!: number;
    private _ballSpeed!: number;
    private _paddleSpeed!: number;
    
    private _ball!: Ball;
    private _leftPaddle!: Paddle;
    private _rightPaddle!: Paddle;

    private _winScore!: number;
    private _winningPlayer: 'leftPlayer' | 'rightPlayer' | undefined = undefined;

    private _pressedKeys = new Set<string>();
    private _isGameOver!: boolean;

    constructor (
        gameWidth: number, sideWidth: number, gameHeight: number, topbarHeight: number, gridSize: number, paddleHeight: number,
        paddleSpeed: number, ballSpeed: number, winScore: number
    ) {
        this.createCanvas(gameWidth, sideWidth, gameHeight, topbarHeight);
        this.initialize(gridSize, paddleHeight, paddleSpeed, ballSpeed, winScore);
    }

    private createCanvas(gameWidth: number, sideWidth: number, gameHeight: number ,topbarHeight: number): void {

        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        this._gameWidth = gameWidth;
        this._sidebarWidth = sideWidth;
        this._gameHeight = gameHeight;
        this._topbarHeight = topbarHeight;
        
        this._canvas = document.createElement("canvas");
        if (this._canvas == null) {
            console.error("Failed to create game canvas.");
        }

        this._canvasWidth = gameWidth + sideWidth * 2;
        this._canvas.width = this._canvasWidth;
        this._canvas.style.width = `${this._canvasWidth}px`;
        this._canvasHeight = gameHeight + topbarHeight;
        this._canvas.height = this._canvasHeight;
        this._canvas.style.height = `${this._canvasHeight}px`;
        this._canvas.id = "pongTable";
        
        document.querySelector<HTMLDivElement>('#app')!.appendChild(this._canvas);

        this._context = this._canvas.getContext('2d')!;
        if (this._context == null) {
            console.error("Failed to get 2D context for game canvas.");
        }

        this.createPopup();

    }

    private initialize(gridSize: number, paddleHeight: number, paddleSpeed: number, ballSpeed: number, winScore: number): void {
        
        this._gridSizeInPx = gridSize;
        this._maxPaddleY = this._gameHeight - gridSize - paddleHeight;
        this._paddleSpeed = paddleSpeed;
        this._ballSpeed = ballSpeed;
        this._winScore = winScore;
        this._isGameOver = true;
        
        this._leftPaddle = new Paddle (
            "leftPlayer", gridSize, paddleHeight,
            this._sidebarWidth + gridSize * 2, this._gameHeight / 2 - paddleHeight / 2
        );

        this._rightPaddle = new Paddle (
            "rightPlayer", gridSize, paddleHeight,
            this._sidebarWidth + this._gameWidth - gridSize * 2, this._gameHeight / 2 - paddleHeight / 2
        );

        this._ball = new Ball (
            gridSize, gridSize, this._canvasWidth / 2, this._canvasHeight / 2,
            this._ballSpeed, - this._ballSpeed
        );

        const myFont = new FontFace('pong-score', `url(${scoreFontUrl}) format('truetype')`);

        myFont.load().then(function(loadedFont) {
            document.fonts.add(loadedFont);
        }).catch(function(error) {
            console.error('Failed to load font:', error);
        });
        
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this._pressedKeys.add(event.code);
        });
    
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this._pressedKeys.delete(event.code);
        });
    
    }

    // 2 rectangular axis-aligned objects
    private collide(paddle: Paddle, ball: Ball): boolean {
        return (
            paddle.getX() < ball.getX() + ball.getWidth() &&
            paddle.getX() + paddle.getWidth() > ball.getX() &&
            paddle.getY() < ball.getY() + ball.getHeight() &&
            paddle.getY() + paddle.getHeight() > ball.getY()
        );
    }

    private processKeysInput(): void {
        let keys = this._pressedKeys;
        this._leftPaddle.setDy(0);
        this._rightPaddle.setDy(0);
        
        if (keys.has("KeyW") && !keys.has("KeyS")) {
            this._leftPaddle.setDy(this._paddleSpeed * -1);
        }
        else if (keys.has("KeyS") && !keys.has("KeyW")) {
            this._leftPaddle.setDy(this._paddleSpeed);
        }

        if (keys.has("ArrowUp") && !keys.has("ArrowDown")) {
            this._rightPaddle.setDy(this._paddleSpeed * -1);
        }
        else if (keys.has("ArrowDown") && !keys.has("ArrowUp")) {
            this._rightPaddle.setDy(this._paddleSpeed);
        }
    }

    private scoreboards = (): void => {
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

    private createPopup(): void {

        const popup = document.createElement("div");
        popup.id = "popup-overlay";

        Object.assign(popup.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(20, 20, 20, 0.8)", // slightly lighter than pure black
            color: "#222", // darker text for contrast
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            zIndex: "1000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            visibility: "hidden",
            padding: "2rem",
            boxSizing: "border-box",
            backdropFilter: "blur(5px)" // subtle blur effect
        });

        const title = document.createElement("h1");
        title.id = "popup-title";
        title.style.fontSize = "2.5rem";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "1rem";
        title.style.color = "#ddd";
        title.style.textShadow = "0 2px 4px rgba(0,0,0,0.6)";

        const message = document.createElement("p");
        message.id = "popup-message";
        message.style.fontSize = "1.2rem";
        message.style.maxWidth = "600px";
        message.style.lineHeight = "1.5";
        message.style.color = "#ddd";
        message.style.textShadow = "0 1px 3px rgba(0,0,0,0.5)";

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
            msgEl.innerHTML = message;
            popup.style.visibility = "visible";
        }

    }

    private hidePopup() {
        const popup = document.getElementById("popup-overlay") as HTMLDivElement;
        if (popup) popup.style.visibility = "hidden";
    }

    public startGameLoop = (): void => {
        
        // Code to run before game loop starts will be here.

        let ctx = this._context!;
        let cWidth = this._canvasWidth!;
        let cHeight = this._canvasHeight;
        let gridSize = this._gridSizeInPx;
        let lPaddle = this._leftPaddle;
        let rPaddle = this._rightPaddle;

        let topHeight = this._topbarHeight;

        // Clear canvas
        ctx.clearRect(0, 0, cWidth, cHeight);

        // Draw walls
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, topHeight, cWidth, gridSize);
        ctx.fillRect(0, cHeight - gridSize, cWidth, gridSize);

        // Draw dotted line down the middle
        for (let i = gridSize; i < cHeight - gridSize; i += gridSize * 2) {
            ctx.fillRect(cWidth / 2 - gridSize / 2, i, gridSize, gridSize);
        }
        
        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(lPaddle.getX(), lPaddle.getY() + topHeight, lPaddle.getWidth(), lPaddle.getHeight());
        ctx.fillRect(rPaddle.getX(), rPaddle.getY() + topHeight, rPaddle.getWidth(), rPaddle.getHeight());
        
        requestAnimationFrame(this.gameLoop);

    }
    
    private gameLoop = (): void => {

        let ctx = this._context!;
        let cWidth = this._canvasWidth!;
        let gWidth = this._gameWidth;
        let sWidth = this._sidebarWidth;
        let cHeight = this._canvasHeight;
        let gHeight = this._gameHeight;
        let topHeight = this._topbarHeight;
        let gridSize = this._gridSizeInPx;
        let maxPaddleY = this._maxPaddleY;
        let ball = this._ball;
        let leftPaddle = this._leftPaddle;
        let rightPaddle = this._rightPaddle;
        let winScore = this._winScore;
        let keys = this._pressedKeys;

        
        
        if (this._isGameOver) {

            let startScreenTitleHTML = "";
            let startScreenHTML = "";

            if (!this._winningPlayer) {
                startScreenTitleHTML = "Control";
                startScreenHTML = `
                    <p>W/S for left player</p>
                    <p>Up/Down Arrows for right player</p>
                    <p>Press Enter to start the game</p>
                `
            }

            else {
                startScreenTitleHTML = "Game End!";
                startScreenHTML = `
                    <p>${this._winningPlayer === "leftPlayer" ? "Left Player" : "Right Player"} wins!</p>
                    <p>Press Enter to start another match</p>
                `
            }

            this.showPopup(startScreenTitleHTML, startScreenHTML)

            if (keys.has("Enter")) {
                leftPaddle.setScore(0);
                rightPaddle.setScore(0);
                leftPaddle.setY((gHeight - leftPaddle.getHeight()) / 2);
                rightPaddle.setY((gHeight - rightPaddle.getHeight()) / 2);
                this._isGameOver = false;
                this.hidePopup()
            }
            
            requestAnimationFrame(this.gameLoop)
            return ;
        
        }
        
        // Clear the game board
        ctx.clearRect(0, 0, cWidth, cHeight);
        
        // Draw walls
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, topHeight, cWidth, gridSize);
        ctx.fillRect(0, cHeight - gridSize, cWidth, gridSize);

        // Draw dotted line down the middle
        for (let i = gridSize; i < cHeight - gridSize; i += gridSize * 2) {
            ctx.fillRect(cWidth / 2 - gridSize / 2, i, gridSize, gridSize);
        }

        this.processKeysInput();
        
        // Move paddles
        if (ball.getToBeReset() == false) {
            leftPaddle.movePaddle1Frame();
            rightPaddle.movePaddle1Frame();
        }

        // Prevent paddles from going through walls
        if (leftPaddle.getY() < gridSize) {
            leftPaddle.setY(gridSize);
        }
        else if (leftPaddle.getY() > maxPaddleY) {
            leftPaddle.setY(maxPaddleY);
        }

        if (rightPaddle.getY() < gridSize) {
            rightPaddle.setY(gridSize);
        }
        else if (rightPaddle.getY() > maxPaddleY) {
            rightPaddle.setY(maxPaddleY);
        }

        let leftX = leftPaddle.getX();
        let leftY = leftPaddle.getY();
        let leftWidth = leftPaddle.getWidth();
        let leftHeight = leftPaddle.getHeight();
        let rightX = rightPaddle.getX();
        let rightY = rightPaddle.getY();
        let rightWidth = rightPaddle.getWidth();
        let rightHeight = rightPaddle.getHeight();
        
        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(leftX, leftY + topHeight, leftWidth, leftHeight);
        ctx.fillRect(rightX, rightY + topHeight, rightWidth, rightHeight);

        // Move ball
        ball.moveBall1Frame();

        // Prevent ball from going through walls by changing its velocity
        if (ball.getY() < gridSize) {
            ball.setY(gridSize);
            ball.setDy(ball.getDy() * -1);
        }
        else if (ball.getY() + ball.getHeight() > gHeight - gridSize) {
            ball.setY(gHeight - gridSize * 2);
            ball.setDy(ball.getDy() * -1);
        }

        // Reset ball if it goes past paddle (but only if we haven't already done so)
        if ( (ball.getX() < sWidth + leftPaddle.getWidth() || ball.getX() > sWidth + gWidth - rightPaddle.getWidth()) && ball.getToBeReset() == false ) {
            
            ball.setToBeReset(true);
            
            // Stop ball
            const tmpDx = ball.getDx();
            const tmpDy = ball.getDy();
            ball.setDx(0);
            ball.setDy(0);

            // Add score
            if (ball.getX() < sWidth + gridSize) {
                rightPaddle.addScore(1);
            }
            else {
                leftPaddle.addScore(1);
            }

            // Give some time for the player to recover before launching the ball again
            setTimeout(() => {
                ball.setToBeReset(false);
                ball.setX(gWidth / 2);
                ball.setY(gHeight / 2);
                ball.setDx(tmpDx);
                ball.setDy(tmpDy);
            }, 1000);
        }

        // Check to see if ball collides with paddle. if they do change x velocity
        if (this.collide(leftPaddle, ball)) {
            ball.setDx(ball.getDx() * -1);
            // Move ball next to the paddle, otherwise the collision will happen again in the next frame
            ball.setX(leftX + leftWidth);
        }
        else if (this.collide(rightPaddle, ball)) {
            ball.setDx(ball.getDx() * -1);
            // move ball next to the paddle, otherwise the collision will happen again in the next frame
            ball.setX(rightX - ball.getWidth());
        }

        // Draw ball
        ctx.fillRect(ball.getX(), ball.getY() + topHeight, ball.getWidth(), ball.getHeight());

        // Draw Scores
        this.scoreboards();

        // Check if winScore is reached
        if (leftPaddle.getScore() >= winScore) {
            this._winningPlayer = "leftPlayer";
            this._isGameOver = true;
        }

        else if (rightPaddle.getScore() >= winScore) {
            this._winningPlayer = "rightPlayer";
            this._isGameOver = true;
        }

        // Next frame
        requestAnimationFrame(this.gameLoop);

    }

}

export function loadLocalGame() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = "" 
    let pong = new Pong(1000, 0, 800, 100, 20, 100, 8, 6, 5);
    pong.startGameLoop();
}
