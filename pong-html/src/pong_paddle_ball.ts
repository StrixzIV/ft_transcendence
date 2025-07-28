export class Paddle {

    private _playerId: string;
    private _width: number;
    private _height: number;
    private _x: number;
    private _y: number;
    private _dy: number;
    private _score: number;

    constructor(playerId: string, width: number, height: number, x: number, y: number) {
        this._playerId = playerId;
        this._width = width;
        this._height = height;
        this._x = x;
        this._y = y;
        this._dy = 0;
        this._score = 0;
    }

    // Getters

    public getPlayerId(): string {
        return (this._playerId);
    }

    public getWidth(): number {
        return (this._width);
    }

    public getHeight(): number {
        return (this._height);
    }
    
    public getX(): number {
        return (this._x);
    }

    public getY(): number {
        return (this._y);
    }

    public getDy(): number {
        return (this._dy);
    }

    public getScore(): number {
        return (this._score);
    }

    // Setters

    public setWidth(width: number): void {
        this._width = width;
    }

    public setHeight(height: number): void {
        this._height = height;
    }
    
    public setX(x: number): void {
        this._x = x;
    }

    public setY(y: number): void {
        this._y = y;
    }

    public setDy(dy: number): void {
        this._dy = dy;
    }

    public setScore(score: number): void {
        this._score = score;
    }

    // Other methods

    public movePaddle1Frame(): void {
        this._y += this._dy;
    }

    public addScore(score: number): void {
        this._score += score;
    }

}

export class Ball {

    private _width: number;
    private _height: number;
    private _x: number;
    private _y: number;
    private _dx: number;
    private _dy: number;
    private _toBeReset: boolean;

    constructor(width: number, height: number, x: number, y: number, dx: number, dy: number) {
        this._width = width;
        this._height = height;
        this._x = x;
        this._y = y;
        this._dx = dx;
        this._dy = dy;
        this._toBeReset = false;
    }

    // Getters
    
    public getWidth(): number {
        return (this._width);
    }

    public getHeight(): number {
        return (this._height);
    }
    
    public getX(): number {
        return (this._x);
    }

    public getY(): number {
        return (this._y);
    }

    public getDx(): number {
        return (this._dx);
    }

    public getDy(): number {
        return (this._dy);
    }

    public getToBeReset(): boolean {
        return (this._toBeReset);
    }

    // Setters
    
    public setWidth(width: number): void {
        this._width = width;
    }

    public setHeight(height: number): void {
        this._height = height;
    }

    public setX(x: number): void {
        this._x = x;
    }

    public setY(y: number): void {
        this._y = y;
    }

    public setDx(dx: number): void {
        this._dx = dx;
    }

    public setDy(dy: number): void {
        this._dy = dy;
    }

    public setToBeReset(b: boolean): void {
        this._toBeReset = b;
    }

    // Other methods

    public moveBall1Frame(): void {
        this._x += this._dx;
        this._y += this._dy;
    }

    // public resetBall(): void {
    //     // this._x = x;
    //     // this._y = y;
    //     // this._dx = dx;
    //     // this._dy = dy;
    // }

}
