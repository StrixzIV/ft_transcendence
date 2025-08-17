# /user/image

This API provides endpoints for retrieving and managing user data, including personal information, profile pictures, and friendships.

## `GET` - /user/image

Retrieve the authenticated user's profile image. Returns a file stream.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful (Returns image file)

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

`500` Internal Server Error (Failed to fetch image from storage)

```json
{
  "error": "Failed to fetch image"
}
```

-----

## `GET` - /user/image/:uid

Retrieve a specific user's profile image by their ID. Returns a file stream.

**Note:** Requires an **access\_token** cookie for authentication.

### Response

`200` Successful (Returns image file)

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

`500` Internal Server Error (Failed to fetch image from storage)

```json
{
  "error": "Failed to fetch image"
}
```

-----

## `POST` - /user/image

Upload a new profile image for the authenticated user.

**Note:** Requires an **access\_token** cookie for authentication and a multipart/form-data request body containing the image file.

### Response

`201` Created

```json
{
  "message": "Upload successful",
  "key": "string"
}
```

`400` Bad Request (Invalid file type or no file uploaded)

```json
{
  "error": "No file uploaded"
}
```

or

```json
{
  "error": "Only image uploads are allowed"
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