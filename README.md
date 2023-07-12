# jetson-flash

This tool allows users to flash balenaOS on supported Jetson devices:

|Device | balena machine name | L4T version |
|-------|---------------------|-------------|
|Jetson Nano eMMC | jetson-nano-emmc |  L4T 32.7.3 |
|Jetson Nano SD-CARD Devkit | jetson-nano | L4T 32.7.2 |
|Jetson Nano 2GB Devkit | jetson-nano-2gb-devkit | L4T 32.7.1 |
|Jetson TX2 | jetson-tx2 | L4T 32.7.3 |
|Jetson TX2 NX (in Jetson Xavier NX Devkit) | jetson-tx2-nx-devkit | L4T 32.7.3 |
|Jetson AGX Xavier | jetson-xavier | L4T 32.7.1 |
|Jetson Xavier NX Devkit eMMC | jetson-xavier-nx-devkit-emmc | L4T 32.7.2 |
|Jetson Xavier NX Devkit SD-CARD | jetson-xavier-nx-devkit | L4T 32.7.3 |
|Jetson AGX Orin Devkit | jetson-agx-orin-devkit | L4T 35.2.1 |
|Jetson Orin Nano 8GB (SD) Devkit NVME | jetson-orin-nano-devkit-nvme | L4T 35.3.1 |

NOTE: The Jetson Orin NX cannot be flashed trough Jetson-Flash, instead a separate container image is used as detaled below in the [Orin NX Flashing](#orin-nx-flashing) section.
The same applies for the Orin Nano Devkit NVME and associated device-types.

## About
Jetson Flash will extract the balenaOS image from a downloaded provisioned image (such as from balenaCloud) and then flashes that image to a Jetson board connected to a host PC via USB.

This tool invokes NVIDIA’s proprietary software to properly partition the eMMC and place the required balenaOS software in the necessary location to make it bootable. Even on Jetson boards without eMMC, this tool may be necessary to initially flash balenaOS because of the way JetPack uses onboard QSPI flash memory for the bootloader. (In those cases, this tool can write to the QSPI so the device will be able to boot balenaOS from the SD card.)

NOTES:
- For the Jetson-TX2 flasher image only, the system-proxy directory entries are not copied over by jetson-flash.
- If flashing Jetson TX2 with a BalenaOS image older than 2.47, please checkout tag 'v0.3.0'. BalenaOS 2.47 updated L4T version from 28.3 to 32.4.2.
- Current BSP version used for flashing each device type is listed above. Please ensure the balenaOS version you are flashing uses the same L4T, by consulting the changelog available in the [BalenaOS Jetson repository](https://github.com/balena-os/balena-jetson/commits/master). 
- Jetson Flash v0.5.10 should be used for flashing devices on L4T 32.4.4.
- The L4T BSP archive is automatically downloaded by the tool during flashing and the L4T version is already updated to match the latest balena-cloud image version.
 
 
## Software required
Jetson Flash requires a Linux-based host (or virtual machine) and has been tested on Ubuntu 20.04 (Focal).

You can either install all the prerequisites listed below or run the provided Docker image (using Docker, not balenaOS) on the host.

### non-Docker

Prerequisites:

- Sudo privileges (required by Tegra Flash and to delete intermediate steps created by the tool in `/tmp/${pid_of_process}`)
- [NodeJS](https://nodejs.org)
- Make sure you have python2 installed and that the `python` binary points to python2.
- Dependencies required for the the L4T package, including: lbzip2, e2fsprogs, dosfstools, libxml2-utils

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

## How to use

Follow the steps below to flash your Jetson board

### Recovery mode

Make sure that the Jetson board is plugged into your host via USB and is in recovery mode before issuing the flashing command. 

**Jetson Nano:**

With power off, enable Force Recovery mode by placing a jumper across the "FRC" pins of the Button Header on the carrier board.

- For carrier board revision A02, these are pins 3 ("FC REC") and 4 ("GND") of Button Header J40 which is located near the camera header.
- For carrier board revision B01, (and the Nano 2GB) these are pins 9 ("GND") and 10 ("FC REC") of Button Header J12, which is located on the edge of the carrier board under the Jetson module.

Then power on the device.

**Jetson Orin Nano Devkit NVME :**

1. Ensure the device is powered off and the power adapter disconnected. Enable Force Recovery mode by placing a jumper across the "FC REC" and "GND" pins located on the edge of the carrier board, under the Jetson Orin Nano module.
2. Connect your host computer to the device's USB-C connector.
3. Connect the power adapter to the Power Jack.
4. The device will automatically power on in Force Recovery Mode.

**Jetson TX2:**

1. Power down the device, removing the AC adapter.
2. Connect the Micro-B plug on the USB cable to the Recovery (USB Micro-B) Port on the device and the other end to an available USB port on the host PC.
3. Connect the power adapter to the device.
4. With the system powered on:
- Press and hold the RECOVERY FORCE button.
- While depressing the RECOVERY FORCE button, press and release the RESET button.
- Wait 2 seconds and release the RECOVERY FORCE button.

**Jetson AGX Xavier:**

1. Connect the developer kit as described above. It should be powered off.
2. Press and hold down the Force Recovery button.
3. Press and hold down the Power button.
4. Release both buttons.

**Jetson Xavier NX:**

1. Ensure the device is powered off and the power adapter disconnected.
2. Place a jumper across the Force Recovery Mode pins. These are pins 9 ("GND") and 10 ("FC REC") of the Button Header (J14).
3. Connect your host computer to the device's USB Micro-B connector.
4. Connect the power adapter to the Power Jack [J16].
5. The device will automatically power on in Force Recovery Mode.

**Jetson AGX Orin:**

- Make sure you put the Type-C plug of the cable into the USB Type-C port next to 40-pin connector for flashing.
- While holding the middle Force Recovery button, insert the USB Type-C power supply plug into the USB Type-C port above the DC jack.
- This will turn on the Jetson dev kit in Force Recovery Mode.
- HOLD DOWN UNTIL you hear the fan and get a usb connection popup on your connected PC

**Jetson Orin NX in Xavier NX Devkit:**

1. Ensure the device is powered off and the power adapter disconnected.
2. Place a jumper across the Force Recovery Mode pins. These are pins 9 ("GND") and 10 ("FC REC") of the Button Header (J14).
3. Connect your host computer to the device's USB Micro-B connector.
4. Connect the power adapter to the Power Jack [J16].
5. The device will automatically power on in Force Recovery Mode.

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

For **non - Docker**, run the tool by specifying the path to the unzipped image (in place of "<balena.img>") and the desired device type (from the "balena machine name" in the table above, in place of "<device_type>"):

```sh
$ ./bin/cmd.js -f <balena.img> -m <device_type>
```

For **Docker**, issue the following commands in the folder that has the Dockerfile to build and ssh into it (building may take a while and appear to hang, so be patient.) Create a folder named `images` in your home directory and place your balena image file there so it's available inside the container.

```sh
docker build -t jf-image .
docker container run --rm -it --privileged -v /dev/bus/usb:/dev/bus/usb -v ~/images:/data/images jf-image /bin/bash
```

Alternatively, run the provided docker-compose file with `docker-compose up` and ssh into the container with `docker exec -it <container name> /bin/bash` 

Once in the container, you can run jetson-flash by specifying the balena image in your host's `~/images/` folder (in place of "<balena.img>") and the desired device type (from the "balena machine name" in the table above, in place of "<device_type>")::

```sh
./bin/cmd.js -f /data/images/<balena.img> -m <device_type>
```

---

The flashing process may take 5 - 15 minutes or longer during which a lot of log output will appear. If all goes well, you'll see something similar to the following upon completion:

```
*** The target t186ref has been flashed successfully. ***
Reset the board to boot from internal eMMC.

```

## Emulation with the Jetson AGX Orin Development Kit

The Orin NX 8GB and 16GB can be emulated during flashing of the Jetson AGX Orin Devkit using this jetson-flash branch: [https://github.com/balena-os/jetson-flash/commits/orin_nx_emulation_on_agx_orin_devkit](https://github.com/balena-os/jetson-flash/commits/orin_nx_emulation_on_agx_orin_devkit)

An example command for flashing the emulated configuration is:
```
sudo bin/cmd.js -m jetson-agx-orin-devkit-as-nx-16gb -f <jetson-agx-orin-devkit.img>
```

Important notes on Orin NX emulation:

- The same Balena AGX Orin Devkit image is used while flashing an emulated Orin NX, thus the cloud will report a Jetson AGX Orin Devkit device type. However, lscpu will report different numbers of CPUs for the emulated devices. Similarly, `cat /proc/device-tree/nvidia,dtsfilename`  will report a different device-tree for each configuration.
- For the Orin NX 8GB emulation, after flashing is completed, it's necessary to edit the file /mnt/sysroot/active/current/boot/extlinux/extlinux.conf and add "mem=8G" (unquoted) to the APPEND element, for example: " ... sdhci_tegra.en_boot_part_access=1 rootwait mem=8G". Once the extlinux.conf file is modified and saved, the device should be rebooted for the available RAM configuration to take effect.
- The emulated configuration is used only during provisioning and is not preserved after a host operating system OTA update.
- These configurations should be used for testing purposes only, and they should never be used to provision production devices
- Cloud support for Orin NX machines can only be evaluated after the hardware is available and the upstream Yocto BSP (meta-tegra) adds support for them.

## Orin NX Flashing:

Important notes on Orin NX provisioning:

- The Docker image and the associated scripts require a Linux-based host and have been validated on a PC running Ubuntu 22.04. Other host operating systems or virtualised environments may also work, provided that the Nvidia BSP flashing tools are able to communicate with the Jetson device successfuly over USB
- The current Orin NX image is based on L4T 35.2.1
- Flashing of the Orin NX module in a Xavier NX Devkit carrier board with a NVME attached can be done solely by using the Docker image inside the Orin_Nx_Nano_NVME folder. The Dockerfile and the scripts inside this folder are not used by jetson-flash and should be used as a stand-alone means for flashing BalenaOS on the Orin NX and the attached NVME.
- Docker needs to be installed on the Host PC and the Docker image needs to be run as privileged
- The balenaOS image downloaded from balena-cloud needs to be unpacked and copied on your Host PC inside the `~/images/` folder. This location will be bind mounted inside the running container.

### Orin NX Flashing steps:

- Attach a NVME drive to the Xavier NX Devkit
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Jetson Orin NX in Force Recovery mode
- Insert the USB stick created above in any of the 4 USB ports of the Xavier NX Devkit
- Navigate to the `Orin_Nx_Nano_NVME` folder and run the Docker image by executing the `build_and_run.sh` script:

## Orin Nano Flashing:

Important notes on Orin Nano provisioning:

- The Docker image and the associated scripts require a Linux-based host and have been validated on a PC running Ubuntu 22.04. Other host operating systems or virtualised environments may also work, provided that the Nvidia BSP flashing tools are able to communicate with the Jetson device successfuly over USB
- The current Orin Nano image is based on L4T 35.3.1
- Flashing of the Orin Nano Devkit with a NVME attached can be done solely by using the Docker image inside the Orin_Nx_Nano_NVME folder. The Dockerfile and the scripts inside this folder are not used by jetson-flash and should be used as a stand-alone means for flashing BalenaOS on the Orin NX and the attached NVME.
- Docker needs to be installed on the Host PC and the Docker image needs to be run as privileged
- The balenaOS image downloaded from balena-cloud needs to be unpacked and copied on your Host PC inside the `~/images/` folder. This location will be bind mounted inside the running container.

### Orin Nano Flashing steps:

- Attach a NVME drive to the Xavier NX Devkit
- Download your balenaOS image from balena-cloud, unpack and write it to a USB stick. We recommend using <a href="https://www.balena.io/etcher">Etcher</a>.
- Place the balenaOS unpacked image inside the folder ~/images on your HOST PC. This location will be automatically bind-mounted in the container image in the `/data/images/` folder
- Put the Jetson Orin Nano in Force Recovery mode
- Insert the USB stick created above in the upper USB port located near the the display port of the Orin Nano Devkit
- Navigate to the `Orin_Nx_Nano_NVME` folder and run the Docker image by executing the `build_and_run.sh` script:


```
~/jetson-flash$ cd Orin_Nx_Nano_NVME/
~/jetson-flash/Orin_Nx_Nano_NVME$ ./build_and_run.sh
```

- Once the docker image has been built and starts running, the balenaOS kernel and flasher image can be booted by executing the `flash_orin_nx.sh` script:

```
root@03ce5cbcbb0d:/usr/src/app/orin-flash# ./flash_orin.sh -f /data/images/balena.img -m <machine>
```

Depending on the device used, the machine used will be one of the two supported:
- jetson-orin-nx-xavier-nx-devkit
- jetson-orin-nano-devkit-nvme


Other considerations:
- The flashing process takes around 10-15 minutes and once it completes, the board will power-off. The device can be taken out of recovery mode and the USB flasher stick can be unplugged.
- Remove and reconnect power to the device.

## Support

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
