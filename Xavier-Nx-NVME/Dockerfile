FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive

# ARG IMAGE_ZIP_FILE=dv-xavier-nx-nvme.zip
# ENV BALENA_IMAGE_ZIP=${IMAGE_ZIP_FILE}

WORKDIR /usr/src/app/xavier-nx-flash

# Install dependencies

RUN apt-get update && apt-get install -q -y --no-install-recommends \
    apt-utils \
    && apt clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -q -y --no-install-recommends \
    python2 \
    python3 \
    python3-pip \
    usbutils \
    curl \
    lbzip2 \
    git \
    wget \
    unzip \
    e2fsprogs \
    dosfstools \
    libxml2-utils \
    && update-alternatives --install /usr/bin/python python /usr/bin/python2 1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


RUN python3 -m pip install --no-cache-dir --upgrade pip && python3 -m pip install --upgrade --no-cache-dir \
    pyyaml

# Unpack BSP archive used for balenaOS kernel rcmboot
RUN mkdir xavier_nx && wget https://developer.nvidia.com/downloads/jetson-linux-r3521-aarch64tbz2 -O xavier_nx/jetson-linux-r3521-aarch64tbz2 && cd xavier_nx && tar xf jetson-linux-r3521-aarch64tbz2 && \
    cd Linux_for_Tegra/ && ./tools/l4t_flash_prerequisites.sh

# Copy rcmboot script inside the Docker image
COPY ./flash_xavier_nx.sh ./*.zip /usr/src/app/xavier-nx-flash/
RUN chmod +x /usr/src/app/xavier-nx-flash/flash_xavier_nx.sh

CMD ["bash", "/usr/src/app/xavier-nx-flash/start.sh"]
