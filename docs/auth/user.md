# /auth/user

This auth endpoint API allows you to register a new user.

## `GET` - /auth/user (FOR TESTING ONLY)

Retrieve all users in the system. **(Testing only; remove in production.)**

### Response

`200` Successful

```json
[
  {
    "id": "ff46bb97-cf52-4ca2-99f6-72170899af69",
    "username": "abc123",
    "email": "alice@example.com",
    "created_at": "2025-07-13T14:54:46.970Z"
  },
  {
    "id": "2a47bd07-cfa2-4ca2-19c1-72170899af123",
    "username": "test",
    "email": "test@example.com",
    "created_at": "2025-07-13T14:00:46.230Z"
  },
  ...
]
```

## `DELETE` - /auth/user/{id} (FOR TESTING ONLY)

Remove user by id **(Testing only; remove in production.)**

### Response

`200` Successful

```json
{
  "message": "User deleted",
  "user": {
    "id": "ff46bb97-cf52-4ca2-99f6-72170899af69",
    "username": "bob",
    "email": "bob@example.com",
    "created_at": "2025-07-13T14:54:46.970Z"
  }
}
```

`404` Not found

```json
{
  "error": "User not found"
}
```

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

`500` Internal Server Error (JWT signed fail)

```json
{
  "error": "Cannot get iat field from JWT"
}
```
