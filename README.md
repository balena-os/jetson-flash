# jetson-flash

> This tool allows users to flash BalenaOS on Jetson supported devices

This tool is separate into two parts:
- Extract resin-image from a resin-image-flasher (this will be moved to [etcher](https://github.com/resin-io/etcher) once the fatfs issues are fixed)
- Flash resin-image via USB on a Jetson board (this will be moved to [etcher](https://github.com/resin-io/etcher))

Balena devices support
---------------------

* Nvidia Jetson TX2
* NVidia Jetson NANO (both sd-card and emmc versions)
* NVidia Jetson Xavier

WARNINGS
--------

Due to issues with the fatfs node module, which does not support some operations we cannot transfer the following Balena configurations:

* system-proxy

Assumptions
-----------

- Linux based host
- Sudo privileges

Prerequisites
-------------

-  A Jetson BalenaOS image

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
 - If flashing Jetson TX2 with a BalenaOS image older than 2.47, please checkout tag 'v0.3.0'. BalenaOS 2.47 updated L4T version from 28.3 to 32.2.

Clone this repository
```sh
$ git clone https://github.com/balena-os/jetson-flash.git
```

Install node dependencies
```sh
$ cd ./jetson-flash
$ npm install
```

Run the cli, specifying desired device type:
```sh
$ ./bin/cmd.js -f balena.img -m <device_type>
```

Current supported device types are: jetson-nano-emmc, jetson-nano-qspi-sd, jetson-tx2, jetson-xavier

Support
-------

If you're having any problems, please [raise an issue](https://github.com/balena-os/jetson-flash/issues/new) on GitHub and the balena.io team will be happy to help.

License
-------

The project is licensed under the Apache 2.0 license.
