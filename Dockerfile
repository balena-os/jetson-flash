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

RUN wget "$bsp_url" -O "/tmp/Linux_for_Tegra.tbz2"  && tar -xvf "/tmp/Linux_for_Tegra.tbz2" -C "/tmp/" && rm /tmp/Linux_for_Tegra.tbz2

CMD ["./run_http_server.sh"]
