#!/bin/bash

# Build Dockerfile
docker build -t dronevolt.azurecr.io/balena-flasher .

# Run resulting Docker image. The balenaOS image downloaded from balena-cloud is expected to exist in the HOST, inside ~/images. That directory will be bind-mounted inside the running container in /data/images/
docker container run --rm -it --privileged -v /dev/:/dev/ -v ~/images:/data/images dronevolt.azurecr.io/balena-flasher:latest /bin/bash
