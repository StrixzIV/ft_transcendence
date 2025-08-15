# /game/room

This API provides endpoints for managing game rooms, specifically for a Pong game.

## `POST` - /game/room/create

Create a new game room.

**Note:** Requires an **access_token** cookie for authentication.

### Response

`201` Created

```json
{
  "gid": "string"
}
```

`401` Unauthorized (Missing or invalid token)

```json
{
  "error": "Missing token"
}
````

or

```json
{
  "error": "Invalid token"
}
```

-----

## `DELETE` - /game/room/delete/:gid

Delete a specific game room.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`204` No Content

`401` Unauthorized (Missing or invalid token)

```json
{
  "error": "Missing token"
}
```

or

```json
{
  "error": "Invalid token"
}
```

`404` Not Found (Missing game room ID in the URL)

```json
{
  "error": "Missing gid"
}
````
