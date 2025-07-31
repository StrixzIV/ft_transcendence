# /auth/login

This auth endpoint API is for normal login.

## `POST` - /auth/login

Validate username and password and return JWT access and refresh token.

### Request JSON schema

```typescript
{
  username: string;
  password: string;
}
```

### Request JSON example

```json
{
  "username": "bob",
  "password": "supersecret"
}
```

### Response

`200` Successful

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

`202` Accepted but required 2FA

```json
{
  "user": {
    "id": "228c3f8d-1577-4073-bce7-16dda1c50b87"
  }
}
```

**Note:** JWT access and refresh token will be sended back as HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include the credentials when asked for JWT instead.)

`401` Login Denied (User already has Google OAuth2 account in the DB)

```json
{ 
  "error": "User is registered with Google sign-in. Please login with Google"
}
```

`401` Invalid username/password

```json
{ 
  "error": "Invalid username or password"
}
```

`500` Internal Server Error (JWT signing is failed)

```json
{
  "error": "Cannot generate login token"
}
```
