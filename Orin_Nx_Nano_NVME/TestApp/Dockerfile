# Cuda Examples can't be compiled with newer glibc, see
# https://forums.developer.nvidia.com/t/cuda-11-5-samples-throw-multiple-error-attribute-malloc-does-not-take-arguments/192750

# AGX Orin, Orin NX and Orin Nano use the same T234 platform, therefore base images can be used
# interchangeably as long as nvidia.list contains the right apt repositoy
FROM balenalib/jetson-agx-orin-devkit-ubuntu:focal

# Prevent apt-get prompting for input
ENV DEBIAN_FRONTEND noninteractive

RUN echo "deb https://repo.download.nvidia.com/jetson/common r35.2 main" >  /etc/apt/sources.list.d/nvidia.list \
       && echo "deb https://repo.download.nvidia.com/jetson/t234 r35.2 main" >>  /etc/apt/sources.list.d/nvidia.list \
       && apt-key adv --fetch-key http://repo.download.nvidia.com/jetson/jetson-ota-public.asc \
       && mkdir -p /opt/nvidia/l4t-packages/ && touch /opt/nvidia/l4t-packages/.nv-l4t-disable-boot-fw-update-in-preinstall

# Download and install BSP binaries for L4T 35.2.1
RUN \
    apt-get update && apt-get install -y wget tar lbzip2 binutils xz-utils zstd && \
    cd /tmp/ && wget https://developer.nvidia.com/downloads/jetson-linux-r3521-aarch64tbz2 -O jetson_linux_r35.2.1_aarch64.tbz2 && \
    tar xf jetson_linux_r35.2.1_aarch64.tbz2 && \
    cd Linux_for_Tegra && \
    sed -i 's/config.tbz2\"/config.tbz2\" --exclude=etc\/hosts --exclude=etc\/hostname/g' apply_binaries.sh && \
    sed -i 's/install --owner=root --group=root \"${QEMU_BIN}\" \"${L4T_ROOTFS_DIR}\/usr\/bin\/\"/#install --owner=root --group=root \"${QEMU_BIN}\" \"${L4T_ROOTFS_DIR}\/usr\/bin\/\"/g' nv_tegra/nv-apply-debs.sh && \
    sed -i 's/chroot . \//  /g' nv_tegra/nv-apply-debs.sh && \
    ./apply_binaries.sh -r / --target-overlay && cd .. \
    rm -rf Linux_for_Tegra && \
    echo "/usr/lib/aarch64-linux-gnu/tegra" > /etc/ld.so.conf.d/nvidia-tegra.conf && ldconfig

## Install X and xfce
RUN \
  apt-get install -y --no-install-recommends \
  xserver-xorg-input-evdev \
  xinit \
  xfce4 \
  xfce4-terminal \
  x11-xserver-utils \
  dbus-x11 \
  xterm

ENV LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/tegra
ENV UDEV=1

# Prevent screen from turning off
RUN echo "#!/bin/bash" > /etc/X11/xinit/xserverrc \
  && echo "" >> /etc/X11/xinit/xserverrc \
  && echo 'exec /usr/bin/X -s 0 dpms' >> /etc/X11/xinit/xserverrc

## If any apt packages install mesa-egl, it will overwrite the tegra-egl
## symlink and ld path, so the following command will ensure tegra-egl remains
## available:
# RUN \
#   echo "/usr/lib/aarch64-linux-gnu/tegra\n/usr/lib/aarch64-linux-gnu/tegra-egl" \
#   > /etc/ld.so.conf.d/000-nvidia-tegra-egl.conf \
#   && ldconfig

## Optional: Sample CUDA Clock sample run in webterminal:
##  apt-get update && apt-get install nvidia-l4t-cuda nvidia-cuda cuda-samples-11-4 && cd /usr/local/cuda-11.4/samples/0_Simple/clock/ && make && ./clock
##  Example Output:
##
## ./simpleTexture
## simpleTexture starting...
## GPU Device 0: "Ampere" with compute capability 8.7
##
## ...
## Processing time: 0.486000 (ms)
## 539.39 Mpixels/sec
## ..
## simpleTexture completed, returned OK

# Start XFCE desktop

CMD ["startxfce4"]
