#!/bin/sh

# Fail on any error
set -e

export VAULT_TOKEN="$VAULT_DEV_ROOT_TOKEN_ID"

echo "[vault-init] Waiting for Vault to be ready..."

# Wait until Vault responds
until vault status >/dev/null 2>&1; do
  sleep 1
done

echo "[vault-init] Vault is ready."

echo "[vault-init] Generated random JWT key."

# Store in Vault KV
vault kv put secret/jwt access_secret="$JWT_ACCESS_TOKEN_SECRETS" refresh_secret="$JWT_REFRESH_TOKEN_SECRETS" algorithm="HS256"

echo "[vault-init] Secret stored successfully!"
