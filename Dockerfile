FROM balenalib/amd64-ubuntu:focal-run-20221210

WORKDIR /usr/src/app/jetson-flash


ARG DEBIAN_FRONTEND=noninteractive
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -       && \
    apt-get -yqq install python2                                               \
                         python3                                               \
                         python3-pip                                           \
                         usbutils                                              \
                         lbzip2                                                \
                         git                                                   \
                         wget                                                  \
                         unzip                                                 \
                         e2fsprogs                                             \
                         dosfstools                                            \
                         libxml2-utils                                         \
                         nodejs                                                \
                         xxd                                                   \
                         lz4                                                && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

ARG bsp_url
ARG device_type

COPY package.json /usr/src/app/
RUN npm install

COPY .  /usr/src/app/jetson-flash

RUN wget "$bsp_url" -O "/tmp/Linux_for_Tegra.tbz2"  && tar -xvf "/tmp/Linux_for_Tegra.tbz2" -C "/tmp/" && rm /tmp/Linux_for_Tegra.tbz2
RUN wget https://developer.nvidia.com/downloads/embedded/L4T/r32_Release_v7.5/overlay_32.7.5_PCN211181.tbz2 -O "/tmp/overlay_32.7.5_PCN211181.tbz2" && mkdir /tmp/overlay && tar xf /tmp/overlay_32.7.5_PCN211181.tbz2 -C /tmp/overlay/ && rm -rf /tmp/overlay_32.7.5_PCN211181.tbz2 && cp /tmp/overlay/Linux_for_Tegra/bootloader/t210ref/BCT/P3448_A00_lpddr4_204Mhz_P987.cfg /usr/src/app/jetson-flash/BCT_OVERLAY_CFG/ && rm -rf /tmp/overlay

CMD ["./run_http_server.sh"]
