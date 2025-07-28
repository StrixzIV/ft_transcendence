import { Paddle, Ball } from "./pong_paddle_ball";

class Pong {

    private _canvas!: HTMLCanvasElement | null;
    private _context!: CanvasRenderingContext2D | null;

    private _canvasWidth!: number;
    private _cavnasHeight!: number;
    private _gridSizeInPx!: number;
    private _maxPaddleY!: number;
    private _ballSpeed!: number;
    private _paddleSpeed!: number;
    
    private _ball!: Ball;
    private _leftPaddle!: Paddle;
    private _rightPaddle!: Paddle;

    private _pressedKeys = new Set<string>();

    // private _gameIsOver: boolean;

    constructor(cWidth: number, cHeight: number, gridSize: number, paddleHeight: number, paddleSpeed: number, ballSpeed: number) {
        this.createCanvas(cWidth, cHeight);
        this.initialize(gridSize, paddleHeight, paddleSpeed, ballSpeed);
    }

    private createCanvas(cWidth: number, cHeight: number): void {
        // document.documentElement.style["overflow"] = "hidden";
        // document.documentElement.style.overflow = "hidden";
        // document.documentElement.style.width = "100%";
        // document.documentElement.style.height = "100%";
        // document.documentElement.style.margin = "0";
        // document.documentElement.style.padding = "0";
        // document.body.style.overflow = "hidden";
        // document.body.style.width = "100%";
        // document.body.style.height = "100%";
        // document.body.style.margin = "0";
        // document.body.style.padding = "0";

        this._canvas = document.createElement("canvas");
        if (this._canvas == null) {
            // Error handling here.
        }
        this._canvasWidth = cWidth;
        this._canvas.style.width = `${cWidth}px`;
        this._cavnasHeight = cHeight;
        this._canvas.style.height = `${cHeight}px`;
        this._canvas.id = "pongTable";
        document.body.appendChild(this._canvas);

        this._context = this._canvas.getContext('2d')!;
        if (this._context == null) {
            // Error handling here.
        }
        this._context.scale(1, 1);
    }

    private initialize(gridSize: number, paddleHeight: number, paddleSpeed: number, ballSpeed: number): void {
        this._gridSizeInPx = gridSize;
        this._maxPaddleY = this._cavnasHeight - gridSize - paddleHeight;
        this._paddleSpeed = paddleSpeed;
        this._ballSpeed = ballSpeed;
        
        this._leftPaddle = new Paddle (
            "leftPlayer", gridSize, paddleHeight,
            gridSize * 2, this._cavnasHeight / 2 - paddleHeight / 2
        );

        this._rightPaddle = new Paddle (
            "rightPlayer", gridSize, paddleHeight,
            this._canvasWidth - gridSize * 3, this._cavnasHeight / 2 - paddleHeight / 2
        );

        this._ball = new Ball (
            gridSize, gridSize, this._canvasWidth / 2, this._cavnasHeight / 2,
            this._ballSpeed, -this._ballSpeed
        );

        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this._pressedKeys.add(event.code);
        });
    
        window.addEventListener('keyup', (event: KeyboardEvent) => {
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
        else if (keys.has("KeyS") && keys.has("KeyW")) {
            this._leftPaddle.setDy(this._paddleSpeed);
        }

        if (keys.has("ArrowUp") && !keys.has("ArrowDown")) {
            this._rightPaddle.setDy(this._paddleSpeed * -1);
        }
        else if (keys.has("KeyS") && keys.has("KeyW")) {
            this._rightPaddle.setDy(this._paddleSpeed);
        }
    }
    
    public startGameLoop = (): void => {
        // Code to be executed before game loop starts are to be put here.
        requestAnimationFrame(this.gameLoop);
    }
    
    private gameLoop = (): void => {

        let ctx = this._context!;
        let cWidth = this._canvasWidth!;
        let cHeight = this._cavnasHeight;
        let gridSize = this._gridSizeInPx;
        let maxPaddleY = this._maxPaddleY;
        let ball = this._ball;
        let leftPaddle = this._leftPaddle;
        let rightPaddle = this._rightPaddle;

        // Clear the board
        ctx.clearRect(0, 0, cWidth, cHeight);

         //   // draw walls
    //   context.fillStyle = 'lightgrey';
    //   context.fillRect(0, 0, canvas.width, grid);
    //   context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

    //   // draw dotted line down the middle
    //   for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    //     context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
    //   }
        
        // Draw walls
        ctx.fillStyle = 'lightgrey';
        // ctx.fillRect(0, 0, cWidth, gridSize);
        // ctx.fillRect(0, cHeight - gridSize, cWidth, cHeight);

        ctx.fillRect(0, 0, 100, 100);
        ctx.fillRect(0, 780, 1000, 800);

        // Draw dotted line down the middle
        for (let i = gridSize; i < cHeight - gridSize; i += gridSize * 2) {
            ctx.fillRect(cWidth / 2 - gridSize / 2, i, gridSize, gridSize);
        }

        this.processKeysInput();
        
        // Move paddles
        leftPaddle.movePaddle1Frame();
        rightPaddle.movePaddle1Frame();

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
        ctx.fillStyle = 'yellow';
        ctx.fillRect(leftX, leftY, leftWidth, leftHeight);
        ctx.fillRect(rightX, rightY, rightWidth, rightHeight);

        // Move ball
        ball.moveBall1Frame();

        // Prevent ball from going through walls by changing its velocity
        if (ball.getY() < gridSize) {
            ball.setY(gridSize);
            ball.setDy(ball.getDy() * -1);
        }
        else if (ball.getY() + gridSize > cHeight - gridSize) {
            ball.setY(cHeight - gridSize * 2);
            ball.setDy(ball.getDy() * -1);
        }

        // Reset ball if it goes past paddle (but only if we haven't already done so)
        if ( (ball.getX() < 0 || ball.getX() > cWidth) && ball.getToBeReset() == false ) {
            ball.setToBeReset(true);
            // Adding score
            if (ball.getX() < 0) {
                rightPaddle.addScore(1);
            }
            else {
                leftPaddle.addScore(1);
            }
            // Give some time for the player to recover before launching the ball again
            setTimeout(() => {
                ball.setToBeReset(false);
                ball.setX(cWidth / 2);
                ball.setY(cHeight / 2);
            }, 400);
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
        ctx.fillRect(ball.getX(), ball.getY(), ball.getWidth(), ball.getHeight());

        // Next frame
        requestAnimationFrame(this.gameLoop);

    }

    // // game loop
    // function loop() {
    //   requestAnimationFrame(loop);
    //   context.clearRect(0,0,canvas.width,canvas.height);

    //   // move paddles by their velocity
    //   leftPaddle.y += leftPaddle.dy;
    //   rightPaddle.y += rightPaddle.dy;

    //   // prevent paddles from going through walls
    //   if (leftPaddle.y < grid) {
    //     leftPaddle.y = grid;
    //   }
    //   else if (leftPaddle.y > maxPaddleY) {
    //     leftPaddle.y = maxPaddleY;
    //   }

    //   if (rightPaddle.y < grid) {
    //     rightPaddle.y = grid;
    //   }
    //   else if (rightPaddle.y > maxPaddleY) {
    //     rightPaddle.y = maxPaddleY;
    //   }

    //   // draw paddles
    //   context.fillStyle = 'white';
    //   context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    //   context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    //   // move ball by its velocity
    //   ball.x += ball.dx;
    //   ball.y += ball.dy;

    //   // prevent ball from going through walls by changing its velocity
    //   if (ball.y < grid) {
    //     ball.y = grid;
    //     ball.dy *= -1;
    //   }
    //   else if (ball.y + grid > canvas.height - grid) {
    //     ball.y = canvas.height - grid * 2;
    //     ball.dy *= -1;
    //   }

    //   // reset ball if it goes past paddle (but only if we haven't already done so)
    //   if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    //     ball.resetting = true;

    //     // give some time for the player to recover before launching the ball again
    //     setTimeout(() => {
    //       ball.resetting = false;
    //       ball.x = canvas.width / 2;
    //       ball.y = canvas.height / 2;
    //     }, 400);
    //   }

    //   // check to see if ball collides with paddle. if they do change x velocity
    //   if (collides(ball, leftPaddle)) {
    //     ball.dx *= -1;

    //     // move ball next to the paddle otherwise the collision will happen again
    //     // in the next frame
    //     ball.x = leftPaddle.x + leftPaddle.width;
    //   }
    //   else if (collides(ball, rightPaddle)) {
    //     ball.dx *= -1;

    //     // move ball next to the paddle otherwise the collision will happen again
    //     // in the next frame
    //     ball.x = rightPaddle.x - ball.width;
    //   }

    //   // draw ball
    //   context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //   // draw walls
    //   context.fillStyle = 'lightgrey';
    //   context.fillRect(0, 0, canvas.width, grid);
    //   context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

    //   // draw dotted line down the middle
    //   for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    //     context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
    //   }
    // }

    // // listen to keyboard events to move the paddles
    // document.addEventListener('keydown', function(e) {

    //   // up arrow key
    //   if (e.which === 38) {
    //     rightPaddle.dy = -paddleSpeed;
    //   }
    //   // down arrow key
    //   else if (e.which === 40) {
    //     rightPaddle.dy = paddleSpeed;
    //   }

    //   // w key
    //   if (e.which === 87) {
    //     leftPaddle.dy = -paddleSpeed;
    //   }
    //   // a key
    //   else if (e.which === 83) {
    //     leftPaddle.dy = paddleSpeed;
    //   }
    // });

    // // listen to keyboard events to stop the paddle if key is released
    // document.addEventListener('keyup', function(e) {
    //   if (e.which === 38 || e.which === 40) {
    //     rightPaddle.dy = 0;
    //   }

    //   if (e.which === 83 || e.which === 87) {
    //     leftPaddle.dy = 0;
    //   }
    // });

    // // start the game
    // // requestAnimationFrame(loop);
}

let pong = new Pong(1000, 800, 20, 100, 6, 4);
pong.startGameLoop();
