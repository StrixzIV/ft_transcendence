#!/bin/bash
set -e

# Start MinIO server in background
minio server /data --console-address ":9001" &
MINIO_PID=$!

echo "⏳ Waiting for MinIO to be ready..."
until curl -s http://localhost:9000/minio/health/ready > /dev/null; do
    sleep 2
done

echo "✅ MinIO is up, configuring client..."

mc alias set myminio http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create bucket if not exists
mc mb myminio/ft-transendence-images || true

echo "✅ Bucket 'ft-transendence-images' created."

if mc stat myminio/ft-transendence-images/default-profile.png > /dev/null 2>&1; then
    echo "default-profile.png already exists, skipping upload."
else
    echo "Uploading default-profile.png..."
    mc cp /init-assets/default-profile.png myminio/ft-transendence-images/
    echo "Uploaded default-profile.png"
fi

# Wait for MinIO process
wait $MINIO_PID
