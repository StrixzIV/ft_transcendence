# /auth/user

This auth endpoint API allows you to register a new user.

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
