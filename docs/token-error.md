# JWT Token Error

## Access token

`401` User not found (somehow uid in cookies doesn't exist)

```json
{
  "error": "User doesn't exist"
}
```

`401` No access token cookie provided

```json
{ 
  "error": "Missing access token"
}
```

`401` Invalid/Expired token cookie

```json
{ 
  "error": "Invalid or expired access token"
}
```

## Refresh Token

`401` User not found (somehow uid in cookies doesn't exist)

```json
{
  "error": "User doesn't exist"
}
```

`401` No access token cookie provided

```json
{ 
  "error": "Missing refresh token"
}
```

`401` Invalid/Expired token cookie

```json
{ 
  "error": "Invalid or expired refresh token"
}
```
