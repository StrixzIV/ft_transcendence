# JWTValidate

Validates a JWT access token via RPC using RabbitMQ.

This function sends the provided JWT to the `rpc.validate-jwt` queue and waits for a response from a consumer that validates the token. Communication is done using the correlation ID pattern with a temporary exclusive reply queue.

## Params and Return value

* `@param {string} token` - The JWT access token to validate.

* `@returns {Promise<any>}` Resolves with the validation result (as parsed JSON) if successful. The structure of the result depends on the validator service.

* `@throws {Error}` Rejects with an error if:
  * The validation service does not respond within 3 seconds.
  * The RabbitMQ connection or channel fails.

## Example

```js
try {
    
    const result = await JWTValidate("your.jwt.token");
    
    if (result.valid) {
        console.log("Token is valid", result.user);
    }
    
    else {
        console.log("Token is invalid");
    }

}

catch (err) {
    console.error("JWT validation failed:", err);
}
```

## Remarks

* Uses an exclusive, auto-deleted reply queue for each validation request.
* Automatically cleans up the consumer and reply queue after receiving a response or hitting the timeout.
* RabbitMQ connection and channel remain open for reuse.
