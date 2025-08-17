#!/bin/bash
set -e

# Wait for Elasticsearch to be available on its default port.
echo "Waiting for Elasticsearch to start..."

until curl -fs http://localhost:9200 -u elastic:$ELASTIC_PASSWORD > /dev/null; do
    echo "Elasticsearch is not yet available. Waiting..."
    sleep 5
done

echo "Elasticsearch is up and running!"

# Reset the password for the 'kibana_system' user
# The -i flag prompts for the new password interactively
echo "Resetting passwords ..."

# Kibana
/usr/share/elasticsearch/bin/elasticsearch-reset-password -u kibana_system -i << EOF > /dev/null 2>&1
y
$KIBANA_PASSWORD
$KIBANA_PASSWORD
EOF

echo "Passwords has been reset."

# Curse but it work line
sleep infinity
