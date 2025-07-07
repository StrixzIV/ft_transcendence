#!/usr/bin/env sh

# Exit on error
set -e

# Run vault
exec vault server -dev \
                    -dev-listen-address=0.0.0.0:8200 \
                    -dev-root-token-id="$VAULT_DEV_ROOT_TOKEN_ID"