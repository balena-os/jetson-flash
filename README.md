# jetson-flash

> This tool allows users to flash ResinOS on Jetson supported devices

This tool is separate into two parts:
- Extract resin-image from a resin-image-flasher (this will be moved to [etcher](https://github.com/resin-io/etcher) once the fatfs issues are fixed)
- Flash resin-image via USB on a Jetson board (this will be moved to [etcher](https://github.com/resin-io/etcher))

Resin devices support
---------------------

* Nvidia Jetson TX2

WARNINGS
--------

Due to issues with the fatfs node module, which does not support some operations we cannot transfer the following resin configurations:

* system-proxy

Assumptions
-----------

- Linux based host
- Sudo privileges

Prerequisites
-------------

-  A Jetson ResinOS image 

Tool dependencies
-----------------

- [NodeJS](https://nodejs.org) (>= v10)
- This tool runs internally the Linux_for_Tegra package that Nvidia provides, so we assume you have all the dependencies for this tool installed.

Getting Started
---------------

NOTE: Make sure that the Jetson board is pluged to your host via USB and is in recovery mode
NOTE: Running the Nvidia flash tool requires sudo priviliges
NOTE: Thist tool will produce all intermidiate steps in `/tmp/${pid_of_process}` and will require sudo priviliges to delete

Clone this repository
```sh
$ git clone https://github.com/resin-os/jetson-flash.git
```

Run the cli, specifying desired device type:
```sh
$ ./bin/cmd.js -f resin.img -m <device_type>
```

Current supported device types are: jetson-nano-emmc, jetson-nano-qspi-sd, jetson-tx2, jetson-xavier

Support
-------

If you're having any problems, please [raise an issue](https://github.com/resin-io/jetson-flash/issues/new) on GitHub and the resin.io team will be happy to help.

License
-------

The project is licensed under the Apache 2.0 license.
