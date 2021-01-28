# jetson-flash

> This tool allows users to flash BalenaOS on Jetson supported devices

This tool is separate into two parts:
- Extract BalenaOS image from a BalenaOS flasher image (this will be moved to [etcher](https://github.com/balena-io/etcher) once the fatfs issues are fixed)
- Flash BalenaOS via USB on a Jetson board (this will be moved to [etcher](https://github.com/balena-io/etcher))

Balena devices support
---------------------

* NVidia Jetson NANO eMMC
* NVidia Jetson Nano SD-CARD
* NVidia Jetson TX2
* NVidia Jetson Xavier AGX
* NVidia Jetson Xavier NX Devkit eMMC
* NVidia Jetson Xavier NX Devkit SD-CARD

WARNINGS
--------

Due to issues with the fatfs node module, which does not support some operations we cannot transfer the following Balena configurations:

* system-proxy

Assumptions
-----------

- Linux based host - we test this tool with Ubuntu
- Sudo privileges

Prerequisites
-------------

- A Jetson BalenaOS image.
- Please unzip the image downloaded from the dashboard before passing it to the flashing tool.

Tool dependencies
-----------------

- [NodeJS](https://nodejs.org) (>= v10)
- This tool runs internally the Linux_for_Tegra package that Nvidia provides, so we assume you have all the dependencies for this tool installed.

Getting Started
---------------

NOTES:
 - Make sure that the Jetson board is pluged to your host via USB and is in recovery mode
 - Running the Nvidia flash tool requires sudo priviliges
 - This tool will produce all intermidiate steps in `/tmp/${pid_of_process}` and will require sudo priviliges to delete
 - If flashing Jetson TX2 with a BalenaOS image older than 2.47, please checkout tag 'v0.3.0'. BalenaOS 2.47 updated L4T version from 28.3 to 32.4.2.
 - Current BSP version used for flashing is L4T 32.4.2 for all boards except for the Jetson Nano (both SD and eMMC), which hve been updated to 32.4.4. Please ensure the BalenaOS version you are flashing uses the same L4T, by consulting the changelog
   available in the [BalenaOS Jetson](https://github.com/balena-os/balena-jetson/commits/master) repository.

Clone this repository
```sh
$ git clone https://github.com/balena-os/jetson-flash.git
```

Run the cli, specifying desired device type:
```sh
$ ./bin/cmd.js -f balena.img -m <device_type>
```

Current supported device types are: jetson-nano-emmc, jetson-nano-qspi-sd, jetson-tx2, jetson-xavier, jetson-xavier-nx-devkit-emmc, jetson-xavier-nx-devkit

Support
-------

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub and the balena.io team will be happy to help.

License
-------

The project is licensed under the Apache 2.0 license.
