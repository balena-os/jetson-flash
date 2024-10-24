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

Depending on the device used, the machine used will be one of:
- jetson-agx-orin-devkit-64-nvme
- jetson-orin-nx-xavier-nx-devkit
- jetson-orin-nano-devkit-nvme
- jetson-orin-nx-seeed-j4012
- jetson-orin-nano-seeed-j3010
