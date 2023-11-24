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
                         xxd                                                && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1 && \
    pip3 install pyyaml

ARG bsp_url
ARG device_type
COPY .  /usr/src/app/jetson-flash

RUN npm install

RUN wget "$bsp_url" -O "/tmp/L4T_BSP_$device_type.tbz2"  && echo "BSP archive for $device_type saved in /tmp/L4T_BSP_$device_type.tbz2, can be downloaded from http://127.0.0.1/L4T_BSP_$device_type.tbz2"

CMD ["./run_http_server.sh"]
