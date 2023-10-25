FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive
WORKDIR /usr/src/app/agx-flash

# Install dependencies
RUN \
    apt update && apt install -y python2 python3 python3-pip usbutils curl lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

# Unpack BSP archive used for balenaOS kernel rcmboot
RUN wget https://developer.nvidia.com/downloads/embedded/l4t/r35_release_v3.1/release/jetson_linux_r35.3.1_aarch64.tbz2 -O jetson_linux_r35.3.1_aarch64.tbz2 && tar xf jetson_linux_r35.3.1_aarch64.tbz2 && \
    cd Linux_for_Tegra/ && ./tools/l4t_flash_prerequisites.sh

# Copy rcmboot script inside the Docker image
COPY ./flash_agx.sh /usr/src/app/agx-flash/
COPY gfst_assets/tegra19x-mb1-pinmux-agx-cti.cfg /usr/src/app/agx-flash/Linux_for_Tegra/bootloader/t186ref/BCT/
COPY gfst_assets/tegra194-agx-cti-AGX101-HEXCUXVR-ECON-AR1335-6CAM.dtb /usr/src/app/agx-flash/Linux_for_Tegra/kernel/dtb/
COPY gfst_assets/tegra194-agx-cti-AGX101-HEXCUXVR-ECON-AR1335-6CAM.dtb /usr/src/app/agx-flash/Linux_for_Tegra/bootloader/tegra194-agx-cti-AGX101-HEXCUXVR-ECON-AR1335-6CAM.dtb.rec
COPY gfst_assets/hexcuxvr-econ-ar1335.conf /usr/src/app/agx-flash/Linux_for_Tegra/jetson-xavier.conf
COPY gfst_assets/cti-agx.conf.common /usr/src/app/agx-flash/Linux_for_Tegra/
COPY gfst_assets/uefi_jetson.bin /usr/src/app/agx-flash/Linux_for_Tegra/bootloader/uefi_jetson.bin
RUN chmod +x /usr/src/app/agx-flash/flash_agx.sh

CMD ["sleep", "infinity"]
