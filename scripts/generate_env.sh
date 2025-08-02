#!/usr/bin/env bash

# Set variables
token_size=64
env_dir=env

append_env() {
    echo $2=$3 >> $1
}

input_with_default() {
    local prompt="$1"
    local default="$2"
    local input=""

    # Prompt for normal input
    read -r -p "$prompt" input
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi

    echo "$input"
}

create_no_sensitive() {
    local file=$env_dir/.no_sensitive.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    DOMAIN_NAME=$(input_with_default "DOMAIN_NAME [default: localhost]: " "localhost")

    append_env $file DOMAIN_NAME $DOMAIN_NAME
}

create_s3() {
    local file=$env_dir/.s3.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    MINIO_ROOT_USER=$(input_with_default "MINIO_ROOT_USER [default: user]: " "user")
    read -s -p "MINIO_ROOT_PASSWORD: " MINIO_ROOT_PASSWORD

    append_env $file MINIO_ROOT_USER $MINIO_ROOT_USER
    append_env $file MINIO_ROOT_PASSWORD $MINIO_ROOT_PASSWORD
}

create_broker() {
    local file=$env_dir/.broker.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    RABBITMQ_DEFAULT_USER=$(input_with_default "RABBITMQ_DEFAULT_USER [default: user]: " "user")
    read -s -p "RABBITMQ_DEFAULT_PASS: " RABBITMQ_DEFAULT_PASS

    append_env $file RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_USER
    append_env $file RABBITMQ_DEFAULT_PASS $RABBITMQ_DEFAULT_PASS
}

create_vault() {
    local file=$env_dir/.vault.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    echo "Creating $file"
    touch $file
    chmod 600 $file

    append_env $file VAULT_DEV_ROOT_TOKEN_ID $(openssl rand -base64 $token_size)
}

create_token() {
    local file=$env_dir/.token.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    append_env $file JWT_ACCESS_TOKEN_SECRETS $(openssl rand -base64 $token_size)
    append_env $file JWT_REFRESH_TOKEN_SECRETS $(openssl rand -base64 $token_size)
}

create_google() {
    local file=$env_dir/.google.env

    if [ -f $file ]; then
	    echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    append_env $file GOOGLE_CLIENT_ID ""
    append_env $file GOOGLE_CLIENT_SECRET ""
}

# Exit on error
set -e
echo "Generating env..."

# Create env dir
mkdir -p env
chmod 700 env

# Create env
echo "============== CREATE ENV ================"
create_no_sensitive
create_broker
create_vault
create_token
create_google
create_s3

echo "Done! .env files are located at ./env/"