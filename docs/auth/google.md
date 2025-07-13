# /auth/google

This auth endpoint API is for Google OAuth2 Login.

## `GET` - /auth/google

Redirects the client to Google’s OAuth 2.0 consent screen.

### Response

`302` Redirect

Redirects to:

```txt
https://accounts.google.com/o/oauth2/v2/auth?... (with query params)
```

With the following query parameters to Google

* `client_id`: Google client ID
* `redirect_uri`: https://localhost:8443/auth/google/callback
* `response_type`: code
* `scope`: openid email profile
* `access_type`: offline
* `prompt`: consent
* `random_state`: random UUID (for CSRF protection)

## `GET` - /auth/google/callback

Process the authorization code returned by Google, create the user if necessary, issue tokens and redirect to your frontend.

`302` Redirect (Successful authentication)

Redirects to:

```txt
https://localhost:8443/?id=<user_id>&username=<username>&expires_at=<unix_timestamp>
```

`302` Redirect (No access code provided back)

```txt
https://localhost:8443/
```

`500` Internal Server Error (Token exchange fail)

```json
{
  "error": "Failed to exchange code for tokens"
}
```

`500` Internal Server Error (JWT signed fail)

```json
{
  "error": "Cannot get iat field from JWT"
}
```
