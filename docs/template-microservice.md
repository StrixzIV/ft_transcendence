# test

You don't need to make your document look exactly same as this template. But use markdown linter when writing docs and please make your document look uniformly to the rest of document.

> `This is guideline of what you should have, not mandatory.`

## Common

For common type of response or schema. In case of lazy to write same type of response or schema case accross api endpoint documentation, which should have exact same look anyway.

### Common Schema

- `Generic Error`

  ```json
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "One API GET Response Fail",
    "type": "object",
    "properties": {
      "error": { "type": "string" }
    },
    "required": [ "error" ]
  }
  ```

### Common Response

- `401` `JWT is invalid or expired`

  ```json
  {
    "error": "Unauthorized Access, Please login first"
  }
  ```

## /api/test/one

This api let you see the gibberish messages and put them to sever.

- `GET`

  - `Request`

    - `JSON Schema`

      ```json
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "One API GET Request",
        "type": "object",
        "properties": {
            "id": {
              "type": "integer",
              "exclusiveMinimum": 0
            }
        },
        "required": []
      }
      ```

    - `Example` `(Only Selected id case)`

      ```json
      {
        "id": 2
      }
      ```

  - `Response`

    - `JSON Schema`

      - `Sucess`

        ```json
        {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "title": "One API GET Response Success",
          "type": "array",
          "item": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer",
                "exclusiveMinimum": 0
              },
              "msg": { "type": "string" }
            },
            "required": [ "id", "msg" ]
          },
        }
        ```

      - `Fail`

    - `Response List`

      - `200` `Sucessful`

        - List all ids'data (no payload)

          ```json
          [
            { "id": 1, "msg": "Hello" },
            { "id": 2, "msg": "World" }
          ]
          ```

        - View specific id (specify id)

          ```json
          [
            { "id": 2, "msg": "World" }
          ]
          ```

      - `400`

        ```json
        {
          "error": "Invalid id number"
        }
        ```

      - `404`

        ```json
        {
          "error": "This id doesn't exist"
        }
        ```

- `POST`

  - `Request`

    - `JSON Schema`

      ```json
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "One API POST Request",
        "type": "object",
        "properties": {
          "msg": { "type": "string" }
        },
        "required": [ "msg" ]
      }
      ```

    - `Example`

      ```json
      {
        "msg": "Hi"
      }
      ```

  - `Response`

    - `JSON Schema`

      - `Sucess` `NO PAYLOAD`

      - `Fail`

    - `Response List`

      - `201` `NO PAYLOAD`

      - `409`

        ```json
        {
          "error": "This message is already existed"
        }
        ```

## /ws/test/one

I will come back to write on this topic later.
