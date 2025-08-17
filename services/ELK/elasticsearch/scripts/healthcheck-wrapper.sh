#!/bin/bash

# Exit on error
set -e

# Fetch
curl -fs http://localhost:9200/_cluster/health -u elastic:$ELASTIC_PASSWORD
