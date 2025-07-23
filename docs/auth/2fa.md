# /auth/2fa

This auth endpoint API is for 2FA Verification.

## `POST` - /auth/2fa/generate

Generate Qrcode url for registing 2FA

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Response

`200` Succesful

```json
{
  "qr_data_url": "qrocde's url in base64",
  "totp_token": "supersecret"
}
```

`401` **Look at `token-error.md`**

`500` Internal Server Error (Failed to genereate QRCode)

```json
{
  "error": "Failed to generate 2FA QRCode"
}
```

## `POST` - /auth/2fa/enable

Turn on 2FA mode (should use after registing is done)

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Response

`200` Succesful

`401` **Look at `token-error.md`**

`409` Conflict (Try to turn on 2FA without generate secret by call /auth/2fa/generate)

```json
{
  "error": "Please, Generate 2FA QRCode before click enable"
}
```

## `POST` - /auth/2fa/disable

Turn off 2FA mode

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Response

`200` Successful

`401` **Look at `token-error.md`**

## `POST` - /auth/2fa/verify

**Note:** JWT access and refresh token is an HTTP-only cookie. (This cookie cannot be accessed with JavaScript. Include it as a credential before request.)

### Request JSON schema

```typescript
{
  token: string;
}
```

### Request JSON example

```json
{
  "totp_token": "supersecret"
}
```

### Response

`200` `Successful`

```json
{
  "user": {
    "uid": "228c3f8d-1577-4073-bce7-16dda1c50b87",
    "username": "bob",
    "mail": "bob@example.com"
  },
  "expires_at": 1755011725
}
```

`401` **Look at `token-error.md`**
