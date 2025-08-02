# FROM alpine:3.19 AS deps

# ARG TARGETARCH

# RUN apk add --no-cache curl bash

# RUN curl -sSL https://dl.min.io/client/mc/release/linux-${TARGETARCH}/mc -o /mc && \
#     chmod +x /mc


FROM minio/minio:latest

# COPY --from=deps /mc /usr/local/bin/mc

COPY scripts/minio-init.sh /minio-init.sh
RUN chmod +x /minio-init.sh

ENTRYPOINT ["/minio-init.sh"]
