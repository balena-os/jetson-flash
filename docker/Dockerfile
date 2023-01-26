FROM balenalib/amd64-ubuntu:focal-run-20221210

ENV DEBIAN_FRONTEND noninteractive

RUN \
    apt update && apt install -y python2 python3 python3-pip nodejs npm usbutils && \
    update-alternatives --install /usr/bin/python python /usr/bin/python2 1

RUN pip3 install pyyaml

WORKDIR /usr/src/app

RUN \
    apt-get update && apt-get install -y lbzip2 git wget unzip e2fsprogs dosfstools libxml2-utils
    
RUN \
    git clone https://github.com/balena-os/jetson-flash.git && \
    cd jetson-flash && \
    npm install

WORKDIR /usr/src/app/jetson-flash


CMD ["sleep", "infinity"]
