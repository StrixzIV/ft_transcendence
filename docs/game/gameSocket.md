# Websocket Endpoint
Here's the updated documentation for the game WebSocket endpoint, including all the important information derived from the provided code.


`wss://${HOSTNAME}:8443/ws/game`

This endpoint facilitates real-time communication for a game of Pong. Players can connect to a specific game room, send input, and receive updates on the game state.

## Connection and Communication

### Joining a Room

A client must send a `join` message as the first message to the server to join a game room.

**Request Message:**

```json
{
  "type": "join",
  "gid": "string"
}
```

* `type`: Must be `"join"`.
* `gid`: The unique ID of the game room to join.

**Server Responses:**

  * **`player_assignment`**: Sent upon successful joining of a room.
    ```json
    {
      "type": "player_assignment",
      "player": "player1" | "player2",
      "roomId": "string"
    }
    ```
  * **`opponent_joined`**: Sent to `player1` when `player2` joins the room.
    ```json
    {
      "type": "opponent_joined"
    }
    ```
  * **`waiting_for_host`**: Sent to `player2` when they join a room with `player1`.
    ```json
    {
      "type": "waiting_for_host"
    }
    ```
  * **`waiting_for_player`**: Sent to the first player to indicate they are waiting for an opponent.
    ```json
    {
      "type": "waiting_for_player"
    }
    ```
  * **`error`**: Sent if the room is not found, is full, or if the initial message is invalid.
    ```json
    {
      "type": "error",
      "message": "string"
    }
    ```

### Starting the Game

Once both players are in the room, `player1` can start the game by sending a `start_game` message.

**Request Message:**

```json
{
  "type": "start_game"
}
```

**Server Response:**

  * **`game_start`**: Broadcast to all players in the room to signal the beginning of the game loop.
    ```json
    {
      "type": "game_start"
    }
    ```

### Game Input

Players can control their paddles by sending `input` messages.

**Request Message:**

```json
{
  "type": "input",
  "key": "string",
  "pressed": boolean
}
```

  * `key`: The key being pressed or released (`"KeyW"`, `"KeyS"`, `"ArrowUp"`, `"ArrowDown"`, `"Enter"`).
  * `pressed`: `true` if the key is pressed, `false` if released.

**Paddle Controls:**

  * `player1` (left paddle) uses **`KeyW`** (up) and **`KeyS`** (down).
  * `player2` (right paddle) uses **`ArrowUp`** (up) and **`ArrowDown`** (down).

**Game Over Reset:**

  * When the game is over, pressing **`Enter`** will reset the game state (scores and ball position).

### Game State Updates

The server broadcasts the game state to all players at a fixed interval (60 frames per second).

**Broadcast Message:**

```ts
{
  "leftPaddleY": number,
  "rightPaddleY": number,
  "ballX": number,
  "ballY": number,
  "leftScore": number,
  "rightScore": number,
  "isGameOver": boolean,
  "winningPlayer": "leftPlayer" | "rightPlayer" | null
}
```

-----

## Disconnection

When a client disconnects, the server handles the room cleanup. If both players leave a room, the room is deleted.
