# /user/data

This API provides endpoints for retrieving and managing user data, including personal information, profile pictures, and friendships.


## `GET` - /user/data

Get the authenticated user's data.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "profile_url": "string"
}
```

`401` Unauthorized (Missing or invalid token)

```json
{
  "error": "Missing token"
}
```

or

```json
{
  "error": "Invalid token"
}
```

`404` Not Found (User data not found in the database after multiple retries)

```json
{
  "error": "User not found"
}
```

`500` Internal Server Error (JWT validation failed)

```json
{
  "error": "JWT validation failed"
}
```

-----

## `GET` - /user/data/:uid

Get a specific user's data by their ID.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "profile_url": "string"
}
```

`400` Bad Request (Missing UID in the URL)

```json
{
  "error": "Missing UID"
}
```

`401` Unauthorized (Missing or invalid token)

```json
{
  "error": "Missing token"
}
```

or

```json
{
  "error": "Invalid token"
}
```

`500` Internal Server Error (JWT validation failed)

```json
{
  "error": "JWT validation failed"
}
```
