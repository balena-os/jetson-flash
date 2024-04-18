#!/usr/bin/env bash
# TODO, to be used eventually as a part of CI for balena-flasher

set -ex

export REPO_DIR="${PWD}"
export TMP_DIR="/home/${USER}/tmp"

mkdir -p ${TMP_DIR}

cd ${TMP_DIR}

git clone git@ssh.dev.azure.com:v3/DroneVoltScandinavia/Kobra/fork-jetson-flash || true
cd fork-jetson-flash/Xavier-Nx-NVME
git checkout dv-slovak-dev

# If not present - the flasher is still created but without the image embedded into it.
zip -j ./dv-xavier-nx-nvme.zip ~/ubuntu-desktop/tmp/balena-jetson-dronevolt/build/tmp/deploy/images/dv-xavier-nx-nvme/balena-image-flasher-dv-xavier-nx-nvme.balenaos-img || true

docker build -t dronevolt.azurecr.io/balena-flasher .
docker login dronevolt.azurecr.io -u dronevolt -p ${SECRET_HERE}
docker image push dronevolt.azurecr.io/balena-flasher:latest

cd ${TMP_DIR}
