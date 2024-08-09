FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive
WORKDIR /usr/src/app/orin-flash

# Install dependencies
RUN \
    apt update && apt install -y python2 python3 python3-pip usbutils curl lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

# Unpack BSP archive used for balenaOS kernel rcmboot
RUN echo "Downloading BSP archive" && mkdir orin && wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/release/jetson_linux_r36.3.0_aarch64.tbz2 -O orin/jetson_linux_r36.3.0_aarch64.tbz2 && cd orin && tar xf jetson_linux_r36.3.0_aarch64.tbz2 && \
    cd Linux_for_Tegra/ && ./tools/l4t_flash_prerequisites.sh

COPY ./uefi/jetson-orin/uefi_jetson.bin /usr/src/app/orin-flash/orin/Linux_for_Tegra/bootloader/uefi_jetson.bin
# Copy rcmboot script inside the Docker image
COPY ./flash_orin.sh /usr/src/app/orin-flash/
RUN chmod +x /usr/src/app/orin-flash/flash_orin.sh

CMD ["sleep", "infinity"]
