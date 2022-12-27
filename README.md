# jetson-flash

> This tool allows users to flash BalenaOS on Jetson supported devices

This tool is separate into two parts:
- Extract BalenaOS image from a BalenaOS flasher image (this will be moved to [etcher](https://github.com/balena-io/etcher) once the fatfs issues are fixed)
- Flash BalenaOS via USB on a Jetson board (this will be moved to [etcher](https://github.com/balena-io/etcher))

Balena devices support
---------------------

* Jetson Nano eMMC - L4T 32.7.2
* Jetson Nano SD-CARD Devkit - L4T 32.7.2
* Jetson Nano 2GB Devkit - L4T 32.7.1
* Jetson TX2 - L4T 32.7.2
* Jetson TX2 NX (in Jetson Xavier NX Devkit) - L4T 32.7.2
* Jetson Xavier AGX - L4T 32.7.1
* Jetson Xavier NX Devkit eMMC - L4T 35.1 - Used for Forecr DSBOARD NX2
* Jetson Xavier NX Devkit SD-CARD - L4T 32.7.2
* Jetson AGX Orin Devkit - L4T 35.1.0

WARNINGS
--------

Due to issues with the fatfs node module, which does not support some operations we cannot transfer the following Balena configurations:

* system-proxy

Assumptions
-----------

- Linux based host - this tool has been tested with Ubuntu 20.04
- Sudo privileges

Prerequisites
-------------

- A Jetson BalenaOS image.
- Please unzip the image downloaded from the dashboard before passing it to the flashing tool.

Tool dependencies
-----------------

- [NodeJS](https://nodejs.org) (v10 or v12. Currently versions newer than v12 are incompatible, see issue #48)
- This tool runs internally the Linux_for_Tegra package, so we assume you have all the dependencies (libxml2, python2, etc) for this tool installed.

Getting Started
---------------

NOTES:
 - Make sure that the Jetson board is pluged to your host via USB and is in recovery mode before issuing the flashing command
 - Make sure that the Node.js used is between 10 and 12
 - Make sure you have python2 installed and that the `python` binary points to python2.
 - Running the Tegra flash tool requires sudo priviliges
 - This tool will produce all intermidiate steps in `/tmp/${pid_of_process}` and will require sudo priviliges to delete
 - If flashing Jetson TX2 with a BalenaOS image older than 2.47, please checkout tag 'v0.3.0'. BalenaOS 2.47 updated L4T version from 28.3 to 32.4.2.
 - Current BSP version used for flashing each device type is mentioned in the "Balena devices support" section above. Please ensure the balenaOS version you are flashing uses the same L4T, by consulting the changelog available in the [BalenaOS Jetson repository](https://github.com/balena-os/balena-jetson/commits/master). Jetson Flash v0.5.10 should be used for flashing devices on L4T 32.4.4.
 - The L4T BSP archive is automatically downloaded by the tool during flashing and the L4T version is already updated to match the latest balena-cloud image version.
 - If running this tool from a container, the Docker image should be run as privileged and /dev/bus/usb needs to be bind-mounted for the Tegra BSP tools to communicate with the device:
```sh
    docker run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb <dockerimage>
```

Clone this repository:
```sh
$ git clone https://github.com/balena-os/jetson-flash.git
```

Install Node.js dependencies by issuing the following command in the jetson-flash directory:
```sh
$ npm install
```

Put the device in recovery mode and connect the device's micro-USB port to your PC (USB-C for the Xavier AGX). Recovery mode can be entered by performing the following steps:
 - For Xavier AGX, AGX Orin Devkit and Jetson TX2: Power the device then press and hold RST, press and hold REC. Release RST then release REC.
 - For Jetson Nano (2GB, SD-CARD, eMMC), Jetson Xavier NX and Jetson TX2 NX: Connect the FC REC and GND pins located under the module with a jumper cable, then power the device. Once the device has been flashed, the jumper cable should be removed for the board to boot normally.

Use lsusb to ensure that the device is in recovery mode and is properly connected to your PC, for example:
```sh
$ lsusb | grep NVIDIA
Bus 001 Device 019: ID 0955:7c18 NVIDIA Corp. T186 [TX2 Tegra Parker] recovery mode
```

Run the cli, specifying the path to the unzipped image and the desired device type:
```sh
$ ./bin/cmd.js -f balena.img -m <device_type>
```

Current supported device types are: jetson-nano-emmc, jetson-nano-qspi-sd, jetson-nano-2gb-devkit, jetson-tx2, jetson-xavier-nx-devkit-tx2-nx, jetson-xavier, jetson-xavier-nx-devkit-emmc, jetson-xavier-nx-devkit, jetson-agx-orin-devkit

Support
-------

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub and the balena.io team will be happy to help.

Submitting changes
------------------

Changes can be submitted in form of PRs to this repository, each PR may include multiple commits.

The header of each commit must not exceed 72 characters in length and must be in 1 line only.

The header and the subject of each commit must be separated by an empty line.

The subject of each commit must not exceed 72 characters per line and can be wrapped to several lines.

The subject and the footer of each commit must be separated by an empty line.

Every pull request must contain at least one commit annotated with the Change-type footer, and all commits should include a Signed-off-by.

An example of a valid commit is:

```
Update Xavier AGX to L4T 32.7.1

Change-type: patch
Signed-off-by: Your Name <user@email.com>
```

License
-------

The project is licensed under the Apache 2.0 license.
