# Instructions for the Jetson AGX Orin Devkit 32GB

<img src="Orin_Flash/images/jetson-agx-orin-devkit-64gb.jpg">

These are the flashing instructions for the Jetson AGX Orin Devkit 32GB. For the list of other balena-supported Jetson devices [See here](./README.md#instructions).

## L4T/balenaOS/jetson-flash compatibility

**Use the version of jetson-flash that corresponds to the version of balenaOS that you would like to provision per the table below.**

(Each version of jetson-flash uses a specific version of NVIDIA's L4T BSP to properly partition the Jetson's boot media. This BSP version must also match the BSP used in the version of balenaOS you're flashing)

| balenaOS version | BSP version | Jetpack version | Use this version of jetson-flash |
|------------------|-------------|-----------------|----------------------------------|
| 5.3.22 or later     | 36.3        | 6.0             | You are on the correct version. (v0.5.73 or greater)      |
| 5.3.12 - 5.3.21    | 35.5.0        | 5.1.3            | [v0.5.72](https://github.com/balena-os/jetson-flash/tree/v0.5.72) |
| 4.1.5 - 5.3.10   | 35.4.1      | 5.1.2           | [v0.5.67](https://github.com/balena-os/jetson-flash/tree/v0.5.67) |
| 2.115.18 - 4.1.2 | 35.3.1      | 5.1.1           | [v0.5.57](https://github.com/balena-os/jetson-flash/tree/v0.5.57) |
| 2.113.32  - 2.115.13   | 35.2.1      | 5.1    |   [0.5.48](https://github.com/balena-os/jetson-flash/tree/v0.5.48)   |
| 2.105.11  - 2.113.31 | 35.1.0  | 5.0.2   |  [0.5.43](https://github.com/balena-os/jetson-flash/tree/v0.5.43)  |

## Requirements
Jetson Flash requires an x86 Linux-based host (or virtual machine) and has been tested on Ubuntu 22.04 (Focal).

You can either install all the prerequisites listed below or run the provided Docker image (using Docker, not balenaOS) on the host.

### non-Docker

Prerequisites:

- Sudo privileges (required by Tegra Flash and to delete intermediate steps created by the tool in `/tmp/${pid_of_process}`)
- [NodeJS](https://nodejs.org)
- Make sure you have python2 installed and that the `python` binary points to python2.
- Dependencies required for the the L4T package, including: lbzip2, e2fsprogs, dosfstools, libxml2-utils, lz4

Installation:

Make sure the prerequesites listed above are installed.

Clone this repository:
```sh
$ git clone https://github.com/balena-os/jetson-flash.git
```

Install Node.js dependencies by issuing the following command in the jetson-flash directory:
```sh
$ npm install
```

### Docker

Prerequisites:

- the Docker image should be run as privileged
- `/dev/bus/usb` needs to be bind-mounted for the Tegra BSP tools to communicate with the device

Installation:

Clone this repository:
```sh
$ git clone https://github.com/balena-os/jetson-flash.git
```

## How to use

Follow the steps below to flash your Jetson board

### Recovery mode

Make sure that the Jetson board is plugged into your host via USB and is in recovery mode before issuing the flashing command. 

We only test jetson-flash on the reference NVIDIA carrier board. If your carrier board varies significantly from the Developer Kit you may need to contact the manufacturer for the proper recovery mode steps.

1. Make sure you connect the Type-C plug of the data cable to the USB Type-C port used for flashing, which is located next to 40-pin connector.
2. While holding the middle Force Recovery button, insert the USB Type-C power supply plug into the USB Type-C port above the DC jack. <img src="Orin_Flash/images/jetson-agx-orin-devkit-64gb_recovery.jpg">
3. This will turn on the Jetson dev kit in Force Recovery Mode.
4. HOLD DOWN UNTIL you hear the fan and get a usb connection popup on your connected PC

**Confirmation**

You can confirm your device is running in recovery mode by issuing the command `lsusb | grep NVIDIA` and examining the output.

You should see something similar to the below, depending on your board:

```
Bus 003 Device 005: ID 0955:7023 NVIDIA Corp. APX

```

(The `APX` is crucial to confirming recovery mode.) 

Or

```
Bus 001 Device 019: ID 0955:7c18 NVIDIA Corp. T186 [TX2 Tegra Parker] recovery mode
```

### Run the tool

For **non - Docker**, run the tool by specifying the path to the unzipped image (in place of "<balena.img>") and the device type as shown below:

```sh
$ ./bin/cmd.js -f <balena.img> -m jetson-agx-orin-devkit
```

For **Docker**, issue the following commands in the folder that has the Dockerfile to build the container (building may take a while and appear to hang, so be patient.) Create a folder named `images` in your home directory and place your balena image file there so it's available inside the container.

```sh
./build.sh [-m jetson-agx-orin-devkit]
```

You can then enter the container using:

```sh
docker container run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb -v ~/images:/data/images jetson-flash-image /bin/bash
```

Alternatively, run the provided docker-compose file with `docker-compose up` and ssh into the container with `docker exec -it <container name> /bin/bash` 

Once in the container, you can run jetson-flash by specifying the balena image in your host's `~/images/` folder (in place of "<balena.img>"):

```sh
./bin/cmd.js -f /data/images/<balena.img> -m jetson-agx-orin-devkit --accept-license=yes -c /tmp/Linux_for_Tegra
```

You can alternatively just run the jetson-flash tool in a single command by running the container with this command:

```sh
docker container run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb -v ~/images:/data/images jetson-flash-image ./bin/cmd.js -f /data/images/<balena.img> -m jetson-agx-orin-devkit --accept-license=yes -c /tmp/Linux_for_Tegra
```

It will exit upon completion. 

---

The flashing process may take 5 - 15 minutes or longer during which a lot of log output will appear. If all goes well, you'll see something similar to the following upon completion:

```
*** The target t186ref has been flashed successfully. ***
Reset the board to boot from internal eMMC.

```
## Support

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub or ask a question [in our forums](https://forums.balena.io/c/share-questions-or-issues-about-balena-jetson-flash-which-is-a-tool-that-allows-users-to-flash-balenaos-on-nvidia-jetson-devices/95) and the balena.io team will be happy to help.


License
-------

The project is licensed under the Apache 2.0 license.
