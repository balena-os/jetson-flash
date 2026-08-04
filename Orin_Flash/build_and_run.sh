#!/usr/bin/env bash

# Build Dockerfile
docker build -t orin-image .

# Run resulting Docker image. The balenaOS image downloaded from balena-cloud is expected to exist in the HOST, inside ~/images. That directory will be bind-mounted inside the running container in /data/images/
docker container run --rm -it --privileged -v /dev/:/dev/ --mount type=bind,source={images_path},target=/data/images orin-image /bin/bash
