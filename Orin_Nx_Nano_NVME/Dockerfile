FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive
WORKDIR /usr/src/app/orin-flash

# Install dependencies
RUN \
    apt update && apt install -y python2 python3 python3-pip usbutils curl lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils vim && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

# Unpack BSP archive used for balenaOS kernel rcmboot
RUN mkdir orin_nx && wget https://developer.nvidia.com/downloads/jetson-linux-r3521-aarch64tbz2 -O orin_nx/jetson_linux_r35.2.1_aarch64.tbz2 && cd orin_nx && tar xf jetson_linux_r35.2.1_aarch64.tbz2 && \
    cd ../ && mkdir orin_nano && cp -r orin_nx/* orin_nano/ && \
    cd orin_nano/Linux_for_Tegra/ && ./tools/l4t_flash_prerequisites.sh

COPY ./uefi/jetson-orin-nano-devkit-nvme/uefi_jetson.bin /usr/src/app/orin-flash/orin_nano/Linux_for_Tegra/bootloader/uefi_jetson.bin
COPY ./uefi/jetson-orin-nx-xavier-nx-devkit/uefi_jetson.bin /usr/src/app/orin-flash/orin_nx/Linux_for_Tegra/bootloader/uefi_jetson.bin
# Copy rcmboot script inside the Docker image
COPY ./flash_orin.sh /usr/src/app/orin-flash/
RUN chmod +x /usr/src/app/orin-flash/flash_orin.sh

CMD ["sleep", "infinity"]
