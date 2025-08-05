FROM minio/minio:latest

COPY scripts/minio-init.sh /minio-init.sh
RUN chmod +x /minio-init.sh

ENTRYPOINT ["/minio-init.sh"]
