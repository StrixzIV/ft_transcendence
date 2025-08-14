# /auth/user

This endpoint handles all user-related actions, including registration and profile updates.

## `POST` - /auth/user

Create a new user account.

### Request JSON schema

```typescript
{
  username: string;
  mail: string;
  password?: string;
}
```

### Request JSON example

```json
{
  "username": "bob",
  "mail": "bob@example.com",
  "password": "supersecret"
}
```

**Note:** Password must have a length of at least 6 characters

### Response

`201` Created

```json
{
  "user": {
    "id": "228c3f8d-1577-4073-bce7-16dda1c50b87",
    "username": "bob",
    "mail": "bob@example.com"
  },
  "expires_at": 1755011725
}
```

`400` Bad Request (Username containing special character)

```json
{
  "error": "Username contains special characters"
}
```

`409` Conflict (User already existed)

```json
{
  "error": "Username or email already exists"
}
```

`500` Internal Server Error (JWT signing is failed)

```json
{
  "error": "Cannot generate login credential"
}
```

## `POST` - `/user/name`

Update the username for an authenticated user.

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

-----

### Request

The request body requires a single field:

```typescript
{
  username: string;
}
```

  - `username`: The new username. It must be a string between 1 and 24 characters and cannot contain any special characters.

### Request example

```json
{
  "username": "new_username_123"
}
```

### Response

`200` OK

This response is sent when the username is successfully updated. The body will be empty.

`400` Bad Request

  - `Username must not be longer than 24 characters`: The new username exceeds the 24-character limit.
  - `Username contains special characters`: The new username contains characters that are not allowed (e.g., `!`, `@`, `#`).

<!-- end list -->

```json
{
  "error": "Username contains special characters"
}
```

`401` Unauthorized

  - `Missing access token`: The required `access_token` cookie is not provided.
  - `Invalid or expired access token`: The provided `access_token` is not valid or has expired.

<!-- end list -->

```json
{
  "error": "Invalid or expired access token"
}
```

`409` Conflict

  - `Username already exists`: The new username is already taken by another user.

<!-- end list -->

```json
{
  "error": "Username already exists"
}
```

`500` Internal Server Error

This response indicates an unexpected error on the server side.

```json
{
  "error": "Internal Server Error"
}
```
