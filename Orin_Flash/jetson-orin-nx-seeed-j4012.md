
# Instructions for the Seeed reComputer J4012 16GB

## L4T/balenaOS/jetson-flash compatibility

The BSP version used by this flashing tool must match the BSP used in the version of balenaOS you're flashing. See the table below to determine which version of jetson-flash you should use:

| BSP version | Jetpack version | balenaOS version | Use this version of jetson-flash |
|-------------|-----------------|------------------|----------------------------------|
| 36.3        | 6.0             | 6.0 or later     | you are on the current version.     |
| 36.3        | 6.0             | v5.3.21+rev4 or later  | you are on the current version. |
| 35.5        | 5.x             | v5.3.21, v5.3.21+rev1, v5.3.21+rev2 and v5.3.21+rev3   | [v0.5.72](https://github.com/balena-os/jetson-flash/commit/fc1904907391f4bb1a8599a477910bcaea932e5e) |


## Requirements
- Docker needs to be installed on the Host PC and the Docker image needs to be run as privileged
- The balenaOS image downloaded from balena-cloud needs to be unpacked and copied on your Host PC inside the `~/images/` folder. This location will be bind mounted inside the running container.
- The Docker image and the associated scripts require a Linux-based host and have been validated on a PC running Ubuntu 22.04. Other host operating systems or virtualised environments may also work, provided that the Nvidia BSP flashing tools are able to communicate with the Jetson device successfully over USB
- We don't formally test Ubuntu 22.04 in VMWare virtual machines, but it seem to work. More specifically, with VMWare Fusion for Mac and VMWare Workstation for Windows. Note: when prompted by VMWare choose to automatically connect the NVIDIA Corp. APX USB device (i.e. the Orin device) to the VM rather than to the host.
- Flashing of Orin devices can be done solely by using the Docker image inside this folder (Orin_Flash). The Dockerfile and the scripts inside this folder are not used by jetson-flash and should be used as a stand-alone means for flashing BalenaOS on Orin devices.


### Orin NX Flashing steps:

- Attach a NVME drive to the Xavier NX Devkit
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Jetson Orin NX in Force Recovery mode:
- <img src="../flash.jpg">
  1. Ensure the device is powered off and the power adapter disconnected.
  2. Place a jumper across the Force Recovery Mode pins. These are pins 9 ("GND") and 10 ("FC REC") of the Button Header (J14).
  3. Connect your host computer to the device's USB Micro-B connector.
  4. Connect the power adapter to the Power Jack [J16].
  5. The device will automatically power on in Force Recovery Mode.
  6. Confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and you should see output similar to: `Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX` (The APX is important)
- Insert the USB stick created above in any of the 4 USB ports of the Xavier NX Devkit
- Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m jetson-orin-nx-xavier-nx-devkit
```

## AGX Orin Devkit 64GB Flashing:

Important notes on AGX Orin Devkit 64GB provisioning:

- By default, balenaOS is flashed on the Jetson AGX Orin 64GB Devkit's eMMC. See steps below to modify this default.
- balenaOS releases for this device type are based on L4T 36.3 - Jetpack 6
- The Orin NX 8GB and 16GB can be emulated during flashing of the Jetson AGX Orin Devkit - [see these instructions](agx_orin_emulation.md)

### AGX Orin Devkit 64GB flashing steps:

- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- If you would like to flash and boot from a NVME drive instead of the eMMC, please follow these steps:
  - After writing your balenaOS image to the USB key, mount the flash-rootA partition of the USB stick and open the file `etc/resin-init-flasher.conf` located in it
  - The first line of this file is `INTERNAL_DEVICE_KERNEL="mmcblk0"`. Replace `mmcblk0` with `nvme0n1`, save and close the file
  - Ensure the flash-rootA partition is unmounted before removing the USB key from your PC
  - IMPORTANT: Flashing balenaOS on the NVME will erase the contents of the device's eMMC as well. Please make sure to back-up your data
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the AGX Orin Devkit 64GB in Force Recovery mode:
  1. Make sure you connect the Type-C plug of the data cable to the USB Type-C port used for flashing, which is located next to 40-pin connector.
  2. While holding the middle Force Recovery button, insert the USB Type-C power supply plug into the USB Type-C port above the DC jack.
  3. This will turn on the Jetson dev kit in Force Recovery Mode.
  4. Release the middle Force Recovery button
  5. Issuing `lsusb` on your PC should show the device in recovery mode, for example: `ID 0955:7023 NVIDIA Corp. APX`
- Insert the USB stick created above in the upper USB port located near the the display port of the AGX Orin Devkit 64GB
- Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m jetson-agx-orin-devkit-64gb
```

## Orin Nano Flashing:

Important notes on Orin Nano provisioning:

- The latest Orin Nano balenaOS images v5.3.21, v5.3.21+rev1, v5.3.21+rev2 and v5.3.21+rev3 are based on L4T 35.5.0
- Draft balenaOS releases at v5.3.21+rev4 or newer are based on L4T 36.3 - Jetpack 6

### Orin Nano Flashing steps:

- Attach a NVME drive to the Orin Nano Devkit
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Jetson Orin Nano in Force Recovery mode:
  1. Ensure the device is powered off and the power adapter disconnected. Enable Force Recovery mode by placing a jumper across the "FC REC" and "GND" pins located on the edge of the carrier board, under the Jetson Orin Nano module.
  2. Connect your host computer to the device's USB-C connector.
  3. Connect the power adapter to the Power Jack.
  4. The device will automatically power on in Force Recovery Mode.
  5. Confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and you should see output similar to: `Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX` (The APX is important)
- Insert the USB stick created above in the upper USB port located near the the display port of the Orin Nano Devkit
- Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m jetson-orin-nano-devkit-nvme
```

## Seeed reComputer J3010 Flashing:

The current Seeed reComputer J3010 image is based on L4T 35.5.0

### Seeed reComputer J3010 Flashing steps:

- Ensure a NVME drive is attached to the Seeed reComputer J3010
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Seeed reComputer J3010 in Force Recovery mode:
  1. Ensure the device is powered off and the power adapter disconnected.
  2. Open the top lid of the reComputer and place a jumper across the Force Recovery Mode pins. These are pins ("GND") and ("FC REC") and are located on the carrier board, under the Orin Nano module.
  3. Connect your host computer to the device's USB-C connector.
  4. Connect the power adapter to the Power Jack [J2].
  5. The device will automatically power on in Force Recovery Mode.
  6. Confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and you should see output similar to: `Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX` (The APX is important)
- Insert the USB stick created above in any of the USB ports of the Seeed reComputer J3010 Flashing
- Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m jetson-orin-nano-seeed-j3010
```

## Seeed reComputer J4012 Flashing:

The current Seeed reComputer J4012 image is based on L4T 35.5.0

### Seeed reComputer J4012 Flashing steps:

- Ensure a NVME drive is attached to the Seeed reComputer J4012
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Seeed reComputer J4012 in Force Recovery mode:
  1. Ensure the device is powered off and the power adapter disconnected.
  2. Open the top lid of the reComputer and place a jumper across the Force Recovery Mode pins. These are pins ("GND") and ("FC REC") and are located on the carrier board, under the Orin NX module.
  3. Connect your host computer to the device's USB-C connector.
  4. Connect the power adapter to the Power Jack [J2].
  5. The device will automatically power on in Force Recovery Mode.
  6. Confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and you should see output similar to: `Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX` (The APX is important)
- Insert the USB stick created above in any of the USB ports of the Seeed reComputer J4012 Flashing
- Navigate to the `Orin_Flash` folder and run the Docker image by executing the `build_and_run.sh` script:
```
~/jetson-flash$ cd Orin_Flash/
~/jetson-flash/Orin_Flash$ ./build_and_run.sh
```
- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:
```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/<balena.img> -m jetson-orin-nx-seeed-j4012
```

Other considerations:
- The flashing process takes around 5-10 minutes and once it completes, the board will power-off. The device can be taken out of recovery mode and the USB flasher stick can be unplugged.
- Remove and reconnect power to the device.

## Support

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub and the balena.io team will be happy to help.


License
-------

The project is licensed under the Apache 2.0 license.
