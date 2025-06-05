# Instructions for the Jetson TX2

<img src="images/jetson-tx2.png">

These are the flashing instructions for the Jetson TX2. For the list of other balena-supported Jetson devices [See here](../README.md#instructions).

## L4T/balenaOS/jetson-flash compatibility

**Use the version of jetson-flash that corresponds to the version of balenaOS that you would like to provision per the table below.**

(Each version of jetson-flash uses a specific version of NVIDIA's L4T BSP to properly partition the Jetson's boot media. This BSP version must also match the BSP used in the version of balenaOS you're flashing)

| balenaOS version | BSP version | Jetpack version | Use this version of jetson-flash |
|------------------|-------------|-----------------|----------------------------------|
| 6.5.38 or later       | 32.7.6      | 4.6.6  | You are on the correct version. (v0.5.88 or later)    |
| 2.108.9+rev1 or later       | 32.7.3      | 4.6.3  | You are on the correct version. (v0.5.35 or later)    |
|2.101.1 - 2.108.9            | 32.7.2      | 4.6.2           |    [v0.5.34](https://github.com/balena-os/jetson-flash/tree/v0.5.34)    |
| 2.95.15+rev1 -  2.101.0     | 32.7.1  | 4.6.1   |   [v0.5.32](https://github.com/balena-os/jetson-flash/tree/v0.5.32)                 |
| 2.87.1+rev1 - 2.95.14       | 32.6.1 | 4.6             |   [v0.5.26](https://github.com/balena-os/jetson-flash/tree/v0.5.26)               |
|2.82.11+rev2 - 2.85.2+rev5   | 32.5.1 | 4.5.1      |   [v0.5.19](https://github.com/balena-os/jetson-flash/tree/v0.5.19)       |
| 2.67.2+rev1 - 2.82.11+rev1  | 32.4.4    | 4.4.1 | [v0.5.10](https://github.com/balena-os/jetson-flash/tree/v0.5.10) |
| 2.50.1+rev1  - 2.60.1+rev2  | 32.4.3  | 4.4  |     [v0.5.5](https://github.com/balena-os/jetson-flash/tree/v0.5.5)                   |
| 2.47.1+rev2 - 2.49.0+rev2   | 32.3.1   | 4.3  |      [v0.4.1](https://github.com/balena-os/jetson-flash/tree/v0.4.1)              |
| 2.39.0+rev1  - 2.47.1+rev1  | 32.2.0   |  4.2 |      [v0.4.0](https://github.com/balena-os/jetson-flash/tree/v0.4.0)                                              |
| Older than 2.47  | 28.3 | 3.3 | [v0.3.0](https://github.com/balena-os/jetson-flash/tree/v0.3.0) |



## Requirements
Jetson Flash requires an x86 Linux-based host (or virtual machine) and has been tested on Ubuntu 22.04 (Focal).

You can either install all the prerequisites listed below or run the provided Docker image (using Docker, not balenaOS) on the host.

## TX2 Notes

- The USB flashing method for the Jetson TX2 is an alternative to SD-CARD provisioning, and can also be used to re-flash TX2s that cannot boot normally due to corrupt QSPI firmware.
- For the Jetson-TX2 flasher image only, the system-proxy directory entries are not copied over by jetson-flash.

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

1. Power down the device, removing the AC adapter.
2. Connect the Micro-B plug on the USB cable to the Recovery (USB Micro-B) Port on the device and the other end to an available USB port on the host PC.
3. Connect the power adapter to the device.
4. With the system powered on:
   - Press and hold the RECOVERY FORCE button.
   - While depressing the RECOVERY FORCE button, press and release the RESET button.
   - Wait 2 seconds and release the RECOVERY FORCE button. <img src="images/jetson-tx2_rec.png">

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
$ ./bin/cmd.js -f <balena.img> -m jetson-tx2
```

For **Docker**, issue the following commands in the folder that has the Dockerfile to build the container (building may take a while and appear to hang, so be patient.) Create a folder named `images` in your home directory and place your balena image file there so it's available inside the container.

```sh
./build.sh [-m jetson-tx2]
```

You can then enter the container using:

```sh
docker container run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb -v ~/images:/data/images jetson-flash-image /bin/bash
```

Alternatively, run the provided docker-compose file with `docker-compose up` and ssh into the container with `docker exec -it <container name> /bin/bash` 

Once in the container, you can run jetson-flash by specifying the balena image in your host's `~/images/` folder (in place of "<balena.img>"):

```sh
./bin/cmd.js -f /data/images/<balena.img> -m jetson-tx2 --accept-license=yes -c /tmp/Linux_for_Tegra
```

You can alternatively just run the jetson-flash tool in a single command by running the container with this command:

```sh
docker container run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb -v ~/images:/data/images jetson-flash-image ./bin/cmd.js -f /data/images/<balena.img> -m jetson-tx2 --accept-license=yes -c /tmp/Linux_for_Tegra
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
