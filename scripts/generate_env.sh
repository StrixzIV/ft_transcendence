#!/usr/bin/env bash

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

    # Read user's input
    echo "============== CREATE ENV ================"
    printf "%s" "RABBITMQ_DEFAULT_USER: "; read RABBITMQ_DEFAULT_USER
    printf "%s" "RABBITMQ_DEFAULT_PASS: "; read -s RABBITMQ_DEFAULT_PASS

    # Construct env
    append_env RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_USER
    append_env RABBITMQ_DEFAULT_PASS $RABBITMQ_DEFAULT_PASS

	echo "Done! .env is located at ./"
fi