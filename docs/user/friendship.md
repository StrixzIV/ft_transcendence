# /user/friends

This API provides endpoints for retrieving and managing user data, including personal information, profile pictures, and friendships.

## `GET` - /user/friends

Get a list of the authenticated user's friends.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "friends": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "profile_url": "string"
    }
  ]
}
```

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

`500` Internal Server Error (Could not fetch friends)

```json
{
  "error": "Could not fetch friends"
}
```

-----

## `GET` - /user/friends/requests

Get a list of pending friend requests sent to the authenticated user.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "requests": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "profile_url": "string"
    }
  ]
}
```

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

`500` Internal Server Error (Could not fetch requests)

```json
{
  "error": "Could not fetch requests"
}
```

-----

## `POST` - /user/friends/:uid

Send a friend request to a user.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "message": "Friend request sent",
  "friendship": {
    "id": "string",
    "requester_id": "string",
    "addressee_id": "string",
    "status": "pending"
  }
}
```

`400` Bad Request (Cannot add yourself or request already exists)

```json
{
  "error": "You cannot add yourself"
}
```

or

```json
{
  "error": "Friend request already exists"
}
```

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

`500` Internal Server Error (Could not create friend request)

```json
{
  "error": "Could not create friend request"
}
```

-----

## `PUT` - /user/friends/:uid/accept

Accept a pending friend request from a user.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "message": "Friend request accepted"
}
```

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

`404` Not Found (Friend request not found)

```json
{
  "error": "Friend request not found"
}
```

`500` Internal Server Error (Could not accept friend request)

```json
{
  "error": "Could not accept friend request"
}
```

-----

## `DELETE` - /user/friends/:uid/deny

Deny a pending friend request from a user.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "message": "Friend request denied"
}
```

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

`404` Not Found (Friend request not found)

```json
{
  "error": "Friend request not found"
}
```

`500` Internal Server Error (Could not deny friend request)

```json
{
  "error": "Could not deny friend request"
}
```

-----

## `DELETE` - /user/friends/:uid

Remove an existing friend.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "message": "Friend removed"
}
```

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

`404` Not Found (Friendship not found)

```json
{
  "error": "Friendship not found"
}
```

`500` Internal Server Error (Could not remove friend)

```json
{
  "error": "Could not remove friend"
}
```