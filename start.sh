#!/usr/bin/env bash

IMAGE_TAG="postgres:11"
CONTAINER_NAME="dockite-postgres"

# Source: https://stackoverflow.com/questions/30543409/how-to-check-if-a-docker-image-with-a-specific-tag-exist-locally
if [[ "$(docker images -q $IMAGE_TAG 2> /dev/null)" == "" ]]; then
  docker pull "$IMAGE_TAG"
fi

if [[ -z "$(docker container ls --all | grep "$CONTAINER_NAME")" ]]; then
  docker run -itd \
    -e "POSTGRES_USER=dockite" \
    -e "POSTGRES_PASSWORD=password" \
    -e "POSTGRES_DATABASE=dockite" \
    -p 5432:5432 \
    --name "$CONTAINER_NAME" "$IMAGE_TAG"
else
  docker start "$CONTAINER_NAME"
fi
