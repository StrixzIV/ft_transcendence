# Satge1: compiling dependencies
FROM nginxinc/nginx-unprivileged:1.28.0-alpine3.21-slim AS build

# Set variables
ARG MODSECURITY_VERSION="3.0.14"
ARG NGINX_VERSION="1.28.0"
ARG NGINX_MODESEC_VERSION="1.0.4"

USER root

# Install build tools & dependencies
# optional lib are: pcre2, yajl
RUN apk add --no-cache \
            make \
            autoconf \
            automake \
            ca-certificates \
            coreutils \
            patch \
            pkgconfig \
            libtool \
            curl \
            g++ \
            gcc \
            git \
            libc-dev \
            libstdc++ \
            linux-headers \
            pcre2-dev \
            yajl-dev

# Start to complie dependencies
WORKDIR /srcs

# Download Source Codes
RUN curl -sSLO https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    curl -sSLO https://github.com/owasp-modsecurity/ModSecurity/releases/download/v3.0.14/modsecurity-v${MODSECURITY_VERSION}.tar.gz && \
    curl -sSLO https://github.com/owasp-modsecurity/ModSecurity-nginx/releases/download/v1.0.4/ModSecurity-nginx-v${NGINX_MODESEC_VERSION}.tar.gz && \
    tar -xzf nginx-${NGINX_VERSION}.tar.gz && \
    tar -xzf modsecurity-v${MODSECURITY_VERSION}.tar.gz && \
    tar -xzf ModSecurity-nginx-v${NGINX_MODESEC_VERSION}.tar.gz

# Build ModSecurity Library
RUN cd modsecurity-v${MODSECURITY_VERSION} && \
    ./build.sh && \
    ./configure --with-yajl --with-pcre2 --enable-silent-rules && \
    make -j$(nproc) install

# Build ModSecurity Nginx-Module
RUN cd nginx-${NGINX_VERSION} && \
    ./configure --add-dynamic-module=../ModSecurity-nginx-v${NGINX_MODESEC_VERSION} --with-compat && \
    make -j$(nproc) modules

FROM nginxinc/nginx-unprivileged:1.28.0-alpine3.21-slim AS runtime

# Set variables
ARG MODSECURITY_VERSION="3.0.14"
ARG NGINX_VERSION="1.28.0"

# Copy thing from build
COPY --from=build /usr/local/modsecurity/lib/libmodsecurity.so.${MODSECURITY_VERSION} /usr/local/modsecurity/lib/
COPY --from=build /srcs/nginx-${NGINX_VERSION}/objs/ngx_http_modsecurity_module.so /etc/nginx/modules/ngx_http_modsecurity_module.so
COPY --from=build --chown=nginx:nginx /srcs/modsecurity-v${MODSECURITY_VERSION}/unicode.mapping /etc/nginx/modsecurity.d/

# Do some root things
USER root

# Install lib's dependencies
RUN apk add --no-cache \
            libstdc++ \
            pcre2 \
            yajl

# Restore soft link of lib
RUN ln -s /usr/local/modsecurity/lib/libmodsecurity.so.${MODSECURITY_VERSION} /usr/local/modsecurity/lib/libmodsecurity.so && \
    ln -s /usr/local/modsecurity/lib/libmodsecurity.so.${MODSECURITY_VERSION} /usr/local/modsecurity/lib/libmodsecurity.so.3

USER nginx

# Copy thing from host
COPY --chown=nginx:nginx ./nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx ./rules.d/ /etc/nginx/rules.d/
COPY --chown=nginx:nginx ./templates/ /etc/nginx/templates/
COPY --chown=nginx:nginx ./modsecurity.d/ /etc/nginx/modsecurity.d/

EXPOSE 8080
