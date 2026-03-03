#!/bin/bash

# Build Dockerfile
docker build -t orin-image .

# Optional: bind-mount the AVerMedia D315 Linux_for_Tegra BSP directory when flashing
# avermedia-d315-agx-orin-64gb. Set AVERMEDIA_BSP_PATH on the host before running:
#   export AVERMEDIA_BSP_PATH=/path/to/avermedia/JetPack_6.2_Linux_JETSON_desktop/Linux_for_Tegra
#   ./build_and_run.sh
AVERMEDIA_BSP_PATH="${AVERMEDIA_BSP_PATH:-}"
avermedia_mount_arg=""
if [ -n "${AVERMEDIA_BSP_PATH}" ] && [ -d "${AVERMEDIA_BSP_PATH}" ]; then
    avermedia_mount_arg="-v ${AVERMEDIA_BSP_PATH}:/data/avermedia-bsp:ro"
    echo "Mounting AVerMedia BSP from: ${AVERMEDIA_BSP_PATH}"
fi

# Run resulting Docker image. The balenaOS image downloaded from balena-cloud is expected to exist in the HOST, inside ~/images. That directory will be bind-mounted inside the running container in /data/images/
docker container run --rm -it --privileged -v /dev/:/dev/ -v ~/images:/data/images ${avermedia_mount_arg} orin-image /bin/bash
