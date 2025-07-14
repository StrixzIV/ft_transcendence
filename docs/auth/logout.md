# /auth/logout

This auth endpoint API revoke and reset JWT access and refresh token in the HTTP-only cookie.

## `POST` - /auth/logout

Invalidate the current refresh token and clear all session cookies.

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Response

`200` Successful

```json
{
  "success": true
}
```

`500` Internal Server Error

```json
{
  "error": "Internal server error"
}
```
