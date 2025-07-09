# Documentation

This Directory is dedicating to store microservics's documentaion. If you are planning to write any microservice, please don't forget to write its document here too.

## Microservice Documentation List

- [`Template`](./template-microservice.md)

## API Documentation Format

Here the list of what we should expect to see from your documents.

- HTTP Methods
- Well Defined JSON Schema [**(Lookup Here)**](https://json-schema.org/learn)
- Clear Separation between Request and Response
- Cases and their HTTP Code

### Overall Document Structure

Here the basic format of your documentation **(in markdown)**

```md
# microservice name

Summarization of your microservice

## /api/foo

Up to you

## /ws/bar

Up to you
```

### API Data Structure

For define API data structure, we will use JSON Schema to define what our data should look like.

Regardless of your preference and understanding on JSON Schema, The overall schema should look like this

- JSON Object

  ```json
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Whatever",
    "type": "object",
    "properties": {},
    "required": []
  }
  ```

- JSON Array

  ```json
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Whatever",
    "type": "array",
    "item": {
      "type": "object",
      "properties": {},
      "required": []
    },
  }
  ```

## Reverse Proxy Policy

### API URL Format

Current API url format must look like this

> `https://<service_label_name>.<domain_name>:<port_no>/<protocol>/`

- `service_label_name` whatever name that reflect the service well
- `domain_name` for development, it's `localhost`
- `port_no` currently it's `8443`
- `protocol` there are only 2 option: `api` for RESTFUL, and `ws` for websocket

### How to route core microservice

1. Go to `./services/nginx_gateway/routes/`

2. Create config file, which name should associate with its service

3. Depend on your service, but its conteent should look like this

> `<$something>` mean replace them with your own thing, they existed for highlighting purpose.

  ```nginx
  server {

    # Port
    listen 443 ssl;
    listen [::]:443 ssl;

    # SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_certificate /run/secrets/ssl_certificate;
    ssl_certificate_key /run/secrets/ssl_key;

    # Main properties
    server_name <$service_label_name>.<$domain_name>;

    # Block illegal url
    include /etc/nginx/rules.d/forbidden-urls-rule.conf;

    # Route to RESTFUL
    # You can delete these lines, if your service won't use RESTFUL API
    location /api/ {
        proxy_pass http://<$actual_service_name>:<$port_no>;
        include /etc/nginx/rules.d/restful-proxy-rule.conf;
    }

    # Route to WS
    # You can delete these lines, if your service won't use websocket
    location /ws/ {
        proxy_pass http://<$actual_service_name>:<$port_no>;
        include /etc/nginx/rules.d/ws-proxy-rule.conf;
    }

    # Logs
    access_log /var/log/nginx/nginx_<$service_label_name>_access.log;
    error_log /var/log/nginx/nginx_<$service_label_name>_error.log;
  }
  ```

## Microservice Authentication
