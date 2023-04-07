FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive
WORKDIR /usr/src/app/orin-nx-flash

# Install dependencies
RUN \
    apt update && apt install -y python2 python3 python3-pip usbutils curl lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

# Unpack BSP archive used for balenaOS kernel rcmboot
RUN wget https://developer.nvidia.com/downloads/jetson-linux-r3521-aarch64tbz2 -O jetson-linux-r3521-aarch64.tbz2 && tar xf jetson-linux-r3521-aarch64.tbz2 && \
	cd Linux_for_Tegra/ && ./tools/l4t_flash_prerequisites.sh

# Copy rcmboot script inside the Docker image
COPY ./flash_orin_nx.sh /usr/src/app/orin-nx-flash
RUN chmod +x /usr/src/app/orin-nx-flash/flash_orin_nx.sh

CMD ["sleep", "infinity"]
