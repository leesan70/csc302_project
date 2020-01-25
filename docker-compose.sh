#!/bin/bash
set -ex

# Script Parameters
service=${1:-csc302}
base=$service-base
dbhost=${2:-mongo}
eshost=${3:-elastic}

# Build caching layer for dependencies
docker build -f Dockerfile.base --build-arg SERVICE_NAME=$base -t $base .

# Build the application
docker-compose build --build-arg SERVICE_NAME=$service --build-arg DB_HOST=$dbhost --build-arg ES_HOST=$eshost

docker-compose up -d