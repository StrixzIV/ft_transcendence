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

# Store JWT in Vault KV
vault kv put secret/jwt \
                access_secret="$JWT_ACCESS_TOKEN_SECRET" \
                refresh_secret="$JWT_REFRESH_TOKEN_SECRET" \
                > /dev/null 2>&1

# Store TOTP Encryption Secret
vault kv put secret/auth \
                totp_encrytion_secret="$TOTP_ENCRYPT_SECRET" \
                > /dev/null 2>&1

# Store Google in Vault KV
vault kv put secret/google \
                google_client_id="$GOOGLE_CLIENT_ID" \
                google_client_secret="$GOOGLE_CLIENT_SECRET" \
                > /dev/null 2>&1

# Store Broker Secret
vault kv put secret/broker \
                rabbit_user="$RABBITMQ_DEFAULT_USER" \
                rabbit_password="$RABBITMQ_DEFAULT_PASS" \
                > /dev/null 2>&1

# Remove vault's token in env after use
unset VAULT_TOKEN
unset VAULT_DEV_ROOT_TOKEN_ID
unset JWT_ACCESS_TOKEN_SECRET
unset JWT_REFRESH_TOKEN_SECRET
unset TOTP_ENCRYPT_SECRET
unset GOOGLE_CLIENT_ID
unset GOOGLE_CLIENT_SECRET
unset RABBITMQ_DEFAULT_USER
unset RABBITMQ_DEFAULT_PASS

echo "[vault-init] Secret stored successfully!"
