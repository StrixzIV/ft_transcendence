#!/usr/bin/env sh

# Exit on error
set -e

# Run vault
exec vault server -dev \
                    -dev-listen-address=0.0.0.0:8200 \
                    > /dev/null 2>&1