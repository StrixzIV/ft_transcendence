# /auth/refresh

This auth endpoint API issues a new access token using a valid refresh token.

## `POST` - /auth/refresh

Validate the provided refresh token, issue a new access token, and set it as a HTTP-only cookie.

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Response

`200` Successful (Set access token cookie only)

`401` Not found (No token cookie provided)

```json
{ 
  "error": "Missing refresh token"
}
```

`401` Not found (Invalid token cookie)

```json
{ 
  "error": "Invalid refresh token"
}
```

`401` Not found (Token expired)

```json
{ 
  "error": "Invalid or expired refresh token"
}
```
