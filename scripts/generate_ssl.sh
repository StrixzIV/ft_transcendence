#!/usr/bin/env bash

if [ -d ./secrets/ssl ]; then
	echo "SSL certificats & keys has already been generated."
else
	echo "Generating self-signed SSL certificate & keys...";

	# Create dir
	mkdir -p ./secrets/ssl
	chmod 700 ./secrets/ssl

	# Create SSL key & crt
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ./secrets/ssl/nginx-selfsigned.key \
		-out ./secrets/ssl/nginx-selfsigned.crt \
		-subj "/C=TH/ST=Bangkok/L=Bangkok/O=42Bangkok/OU=42/CN=localhost"

	echo "Done! SSL certificats & keys are located at secrets/."
fi
