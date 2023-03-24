FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive

RUN \
    apt update && apt install -y python2 python3 python3-pip usbutils curl && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

RUN pip3 install pyyaml

WORKDIR /usr/src/app

RUN \
    apt-get update && apt-get install -y lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils nodejs
    
RUN node --version && npm --version
RUN \
    git clone https://github.com/balena-os/jetson-flash.git && \
    cd jetson-flash && \
    npm install

WORKDIR /usr/src/app/jetson-flash


CMD ["sleep", "infinity"]
