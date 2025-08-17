FROM elasticsearch:8.12.0

COPY --chown=elasticsearch:root ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

COPY --chown=elasticsearch:root ./scripts/modded-docker-entrypoint.sh /usr/share/elasticsearch/bin/modded-docker-entrypoint.sh
COPY --chown=elasticsearch:root ./scripts/reset-password.sh /usr/share/elasticsearch/bin/reset-password.sh

RUN chmod +x /usr/share/elasticsearch/bin/reset-password.sh && \
    chmod +x /usr/share/elasticsearch/bin/modded-docker-entrypoint.sh

ENTRYPOINT [ "/usr/share/elasticsearch/bin/modded-docker-entrypoint.sh" ]
