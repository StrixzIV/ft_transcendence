#!/usr/bin/env bash

# Set variables
token_size=48
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

    # Enforcing 8 characters password
    while true; do
        read -s -p "MINIO_ROOT_PASSWORD (At least 8 characters): " MINIO_ROOT_PASSWORD
        echo ""

        if [ ${#MINIO_ROOT_PASSWORD} -lt 8 ]; then
            echo "❌ Password must be at least 8 characters long. Please try again."
        else
            break
        fi
    done

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
    echo ""

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

    append_env $file VAULT_DEV_ROOT_TOKEN_ID "\"$(openssl rand -base64 $token_size | tr -d '\n')\""
}

create_token() {
    local file=$env_dir/.token.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    append_env $file JWT_ACCESS_TOKEN_SECRET "\"$(openssl rand -base64 $token_size | tr -d '\n')\""
    append_env $file JWT_REFRESH_TOKEN_SECRET "\"$(openssl rand -base64 $token_size | tr -d '\n')\""
    append_env $file TOTP_ENCRYPT_SECRET "\"$(openssl rand -base64 24 | tr -d '\n')\"" # use for aes-256, so change = break whole codebase + database
}

create_google() {
    local file=$env_dir/.google.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    append_env $file GOOGLE_CLIENT_ID "\"\""
    append_env $file GOOGLE_CLIENT_SECRET "\"\""
}

create_elastic() {
    local file=$env_dir/.elastic.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    # Enforcing 8 characters password
    while true; do
        read -s -p "ELASTIC_PASSWORD (At least 8 characters): " ELASTIC_PASSWORD
        echo ""

        if [ ${#ELASTIC_PASSWORD} -lt 8 ]; then
            echo "❌ Password must be at least 8 characters long. Please try again."
        else
            break
        fi
    done

    append_env $file ELASTIC_PASSWORD $ELASTIC_PASSWORD
}

create_kibana() {
    local file=$env_dir/.kibana.env

    if [ -f $file ]; then
        echo "$file files have already been generated."
        return 0
    fi

    touch $file
    chmod 600 $file

    append_env $file KIBANA_PASSWORD "\"$(openssl rand -base64 $token_size | tr -d '\n')\""
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
create_elastic
create_s3
create_vault
create_token
create_google
create_kibana

echo "Done! .env files are located at ./env/"