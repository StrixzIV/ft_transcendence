# JWT Token Error

## Access toekn

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

`401` Invalid token cookie

```json
{ 
  "error": "Invalid access token"
}
```

`401` Token expired

```json
{ 
  "error": "Expired access token"
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

`401` Invalid token cookie

```json
{ 
  "error": "Invalid refresh token"
}
```

`401` Token expired

```json
{ 
  "error": "Expired refresh token"
}
```
