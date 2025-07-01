#!/usr/bin/env bash

TOKEN_SIZE=64

append_env() {
    echo $1=$2 >> .env
}

if [ -f ./.env ]; then
	echo "env has already been generated."
else
	echo "Generating env...";

    # Create env file
    touch .env
	chmod 600 ./.env

    # Get env
    echo "============== CREATE ENV ================"
    printf "%s" "RABBITMQ_DEFAULT_USER: "; read RABBITMQ_DEFAULT_USER
    printf "%s" "RABBITMQ_DEFAULT_PASS: "; read -s RABBITMQ_DEFAULT_PASS; echo

    VAULT_DEV_ROOT_TOKEN_ID=$(openssl rand -base64 $TOKEN_SIZE)
    JWT_ACCESS_TOKEN_SECRETS=$(openssl rand -base64 $TOKEN_SIZE)
    JWT_REFRESH_TOKEN_SECRETS=$(openssl rand -base64 $TOKEN_SIZE)

    # Construct env
    append_env RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_USER
    append_env RABBITMQ_DEFAULT_PASS $RABBITMQ_DEFAULT_PASS
    append_env VAULT_DEV_ROOT_TOKEN_ID $VAULT_DEV_ROOT_TOKEN_ID
    append_env JWT_ACCESS_TOKEN_SECRETS $JWT_ACCESS_TOKEN_SECRETS
    append_env JWT_REFRESH_TOKEN_SECRETS $JWT_REFRESH_TOKEN_SECRETS

	echo "Done! .env is located at ./"
fi