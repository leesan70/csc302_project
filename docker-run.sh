#!/bin/bash
set -ex

# Script Parameters
service=${1:-csc302}
base=$service-base
dbhost=${2:-host.docker.internal}
eshost=${3:-localhost}

# Build caching layer for dependencies
docker build -f Dockerfile.base -t $base .

# Build the application
docker build --build-arg SERVICE_NAME=$service --build-arg DB_HOST=$dbhost --build-arg ES_HOST=$eshost -t $service .

# Run service
docker run -d -p 3001:3001 -v $(pwd):/dist -t $service