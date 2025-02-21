# Instructions for the Forecr DSBOARD ORXN

<img src="images/forecr-dsb-ornx.jpg">

These are the flashing instructions for the [Forecr DSBOARD-ORNX](https://www.forecr.io/products/carrier-board-dsboard-ornx) and [Forecr DSBOARD-ORNX-LAN](https://www.forecr.io/products/nvidia-jetson-orin-nx-orin-nano-carrier-board-dsboard-ornx-lan) carrier boards with Jetson Orin NX or Jetson Orin Nano modules. [See here](../README.md#instructions) for the list of other supported Jetson devices.

The flashing procedure is common for all DSBOARD-ORNX variants. The images are not! Make sure to pick the one matching the board (ORNX / ORNX-LAN) and the module (Orin Nano, Orin NX) in use. Refer to the board manual for the location of the RESET and RECOVERY buttons as well as the RECOVERY USB port.

## Requirements
- Docker needs to be installed on the x86 Host PC and the Docker image needs to be run as privileged
- The balenaOS image downloaded from balena-cloud needs to be unpacked and copied on your Host PC inside the `~/images/` folder. This location will be bind mounted inside the running container.
- The Docker image and the associated scripts require a Linux-based host and have been validated on a PC running Ubuntu 22.04. Other host operating systems or virtualized environments may also work, provided that the Nvidia BSP flashing tools are able to communicate with the Jetson device successfully over USB
- We don't formally test Ubuntu 22.04 in VMWare virtual machines, but it seem to work. More specifically, with VMWare Fusion for Mac and VMWare Workstation for Windows. Note: when prompted by VMWare choose to automatically connect the NVIDIA Corp. APX USB device (i.e. the Orin device) to the VM rather than to the host.

### Forecr DSBOARD-ORNX flashing steps:

1. Ensure a NVME drive is attached to the board
2. Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
3. Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
4. Put the board in Force Recovery mode:
   1. Connect your host computer via USB-C to the RECOVERY USB port on the board.
   1. Press and hold RECOVERY button
   2. Press and release RESET button while still holding the RECOVERY button
   5. The device will go into the Force Recovery Mode.
   6. Confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and you should see output similar to: `Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX` (The APX is important)
5. Insert the USB stick created above in any of the remaining USB ports on the board
6. Clone this repo to your host PC.
7. Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
8. Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m forecr-dsb-ornx-(variant)
```
Substitute forecr-dsb-ornx-(variant) to match the module in use:

    forecr-dsb-ornx-orin-nano-4gb
    forecr-dsb-ornx-orin-nano-8gb
    forecr-dsb-ornx-orin-nx-16gb

    forecr-dsb-ornx-lan-orin-nano-4gb
    forecr-dsb-ornx-lan-orin-nano-8gb
    forecr-dsb-ornx-lan-orin-nx-16gb

Other considerations:
- The flashing process takes several minutes and once it completes, the board will power-off. 
- Remove and reconnect power to the device.

## Support

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub or ask a question [in our forums](https://forums.balena.io/c/share-questions-or-issues-about-balena-jetson-flash-which-is-a-tool-that-allows-users-to-flash-balenaos-on-nvidia-jetson-devices/95) and the balena.io team will be happy to help.


License
-------

The project is licensed under the Apache 2.0 license.
