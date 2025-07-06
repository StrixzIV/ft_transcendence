#!/usr/bin/env sh

# Exit on any error
set -e

# export vault's token to env
export VAULT_TOKEN=$VAULT_DEV_ROOT_TOKEN_ID

echo "[vault-init] Waiting for Vault to be ready..."

# Wait until Vault responds
until vault status >/dev/null 2>&1; do
  sleep 1
done

echo "[vault-init] Vault is ready."
echo "[vault-init] Storing tokens..."

# Store in Vault KV
vault kv put secret/jwt \
                access_secret="$JWT_ACCESS_TOKEN_SECRETS" \
                refresh_secret="$JWT_REFRESH_TOKEN_SECRETS" \
                algorithm="HS256" \
                > /dev/null 2>&1

# Remove vault's token in env after use
unset VAULT_TOKEN
unset VAULT_DEV_ROOT_TOKEN_ID
unset JWT_ACCESS_TOKEN_SECRETS
unset JWT_REFRESH_TOKEN_SECRETS

echo "[vault-init] Secret stored successfully!"
