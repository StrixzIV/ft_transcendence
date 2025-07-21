#!/usr/bin/env bash

# Get env
set -a
source ./env/.no_sensitive.env
set +a

# Set variables
ssl_dir=./secrets/ssl
ssl_name=server # Don't edit this, until you edit in nginx-ssl first

if [ -d $ssl_dir ]; then
	echo "SSL certificats & keys has already been generated."
else
	echo "Generating self-signed SSL certificate & keys..."

	# Create dir
	mkdir -p $ssl_dir
	chmod 700 $ssl_dir

	# Create SSL key & crt
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout $ssl_dir/$ssl_name.key \
		-out $ssl_dir/$ssl_name.crt \
		-subj "/C=TH/ST=Bangkok/L=Bangkok/O=42Bangkok/OU=42/CN=$DOMAIN_NAME" \
		> /dev/null 2>&1

	echo "Done! SSL certificats & keys are located at secrets/."
fi
