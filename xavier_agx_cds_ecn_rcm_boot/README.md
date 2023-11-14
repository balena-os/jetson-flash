## AGX Flashing

Important notes on the custom AGX device provisioning:

- The Docker image and the associated scripts require a Linux-based host and have been validated on a PC running Ubuntu 22.04. Other host operating systems or virtualised environments may also work, provided that the Nvidia BSP flashing tools are able to communicate with the Jetson device successfuly over USB.
- The current device image is based on `L4T 35.3.1`.
- Flashing of the device with a NVME attached to the carrier board can be done solely by using the Docker image inside the `xavier_agx_cds_ecn_rcm_boot` folder. This folder is available only on the `xavier_cds_ecn_rcm` branch of this github repository. The Dockerfile and the scripts inside this folder are not used by jetson-flash and should be used as a stand-alone means for flashing BalenaOS on the AGX device and the attached NVME.
- Docker needs to be installed on the Host PC and the Docker image needs to be run as privileged.
- The balenaOS image downloaded from balena-cloud needs to be unpacked and copied on your Host PC inside the `~/images/` folder. This location will be bind mounted inside the running container.
- The `flash_agx.sh` script used in the `Flashing steps` listed below unpacks the balenaOS image provided trough command line and bindmounted in the containter in `/data/images`, and extracts the balenaOS kernel from it. The balenaOS kernel is then passed to the NVidia flashing tools to be run in recovery mode - rcm boot. Once the balenaOS kernel is booted, it waits for a maximum of 20 minutes for a USB stick containing the balenaOS image obtained from balena-cloud (same image as the one present in `/data/images/` in container) to be plugged into the device. Once the USB stick is connected and the image is detected by the kernel, it will start provisioning the on-board NVME with balenaOS. As soon as provisioning is completed, the device will reboot into the newly flashed balenaOS image.

### Flashing steps:

- Make sure a NVME is attached to the carrier board.
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder `~/images` on your HOST PC. This location will be automatically bind-mounted in the container in the `/data/images/` folder.
- Put the Device in Force Recovery mode and connect the device's USB-C port to your Host computer.
- Navigate to the `xavier_agx_cds_ecn_rcm_boot` folder and run the Docker image by executing the `build_and_run.sh` script:


```
~/jetson-flash$ cd xavier_agx_cds_ecn_rcm_boot/
~/jetson-flash/xavier_agx_cds_ecn_rcm_boot$ ./build_and_run.sh
```

- Once the docker image has been built and starts running, the balenaOS kernel can be booted by executing the `flash_agx.sh` script:

```
root@03ce5cbcbb0d:/usr/src/app/agx-flash# ./flash_agx.sh -f /data/images/<balena.img> --accept-license yes
```

while ensuring `balena.img` is replaced with the actual file name of the unzipped image downloaded from balena-cloud.

- After the script `flash_agx.sh` has finished executing, you can remove the USB-C cable from the carrier board and insert the USB stick on which you wrote the image downloaded from balena-cloud, into the carrier board. The USB stick should be connected within 20 minutes from when the `flash_agx.sh` script exited. If your carrier board has multiple USB ports, the USB stick can be left connected before any of the scripts are run.
- The `flash_agx.sh` script unpacks the balena kernel extracted from `balena.img`, and as soon as the USB is attached it starts flashing the internal storage with balenaOS.
- Once the balenaOS image on the USB stick has finished flashing the internal media it will report the `post-provisioning` state in the balena-cloud dashboard and will then reboot automaticaly. Once the device reports the Host OS version in the dashboard, the USB stick can be disconnected.
