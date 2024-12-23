# jetson-flash
A set of tools that allows users to flash balenaOS on supported Jetson devices.

<img src="flash.jpg">

## About
Jetson Flash will extract the balenaOS image from a downloaded provisioned image (such as from balenaCloud) and then flash that image to a Jetson board connected to a host PC via USB.

This tool invokes NVIDIA’s proprietary software to properly partition the boot media (such as eMMC) and place the required balenaOS software in the necessary location to make it bootable. Even on Jetson boards without eMMC, this tool may be necessary to initially flash balenaOS because of the way JetPack uses onboard QSPI flash memory for the bootloader. (In those cases, this tool can write to the QSPI so the device will be able to boot balenaOS from the SD card.)

## Instructions

Choose your device from the list below for step-by-step instructions:

|Device | Current L4T version |
|-------|---------------------|
|[Jetson Nano eMMC](./docs/jetson-nano-emmc.md) | L4T 32.7.3 |
|[Jetson Nano SD-CARD Devkit](./docs/jetson-nano.md) | L4T 32.7.3 |
|[Jetson Nano 2GB Devkit](./docs/jetson-nano-2gb-devkit.md) | L4T 32.7.1 |
|[Jetson TX2](./docs/jetson-tx2.md) | L4T 32.7.3 |
|[Jetson TX2 NX (in Jetson Xavier NX Devkit)](./docs/jetson-tx2-nx-devkit.md) | L4T 32.7.3 |
|[Jetson AGX Xavier](./docs/jetson-xavier.md) | L4T 32.7.5 |
|[Jetson Xavier NX Devkit eMMC](./docs/jetson-xavier-nx-devkit-emmc.md) | L4T 32.7.3 |
|[Jetson Xavier NX Devkit SD-CARD](./docs/jetson-xavier-nx-devkit.md) | L4T 32.7.3 |
|[Jetson AGX Orin Devkit 32GB](./docs/jetson-agx-orin-devkit.md) | L4T 36.3 | 
|[Jetson AGX Orin Devkit 64GB](./docs/jetson-agx-orin-devkit-64gb.md) | L4T 36.3 |
|[Jetson Orin Nano 8GB (SD) Devkit NVME](./docs/jetson-orin-nano-devkit-nvme.md) | L4T 36.3 |
|[Jetson Orin NX in Xavier NX Devkit NVME](./docs/jetson-orin-nx-xavier-nx-devkit.md) | L4T 36.3 |
|[Seeed reComputer J3010 4GB](./docs/jetson-orin-nano-seeed-j3010.md) | L4T 36.3 |
|[Seeed reComputer J4012 16GB](./docs/jetson-orin-nx-seeed-j4012.md) | L4T 36.3 |

**Don't see your device listed?**
- Use the closest match above to the Jetson module on your carrier board
- Reach out to us on the [balena Forums](https://forums.balena.io/c/share-questions-or-issues-about-balena-jetson-flash-which-is-a-tool-that-allows-users-to-flash-balenaos-on-nvidia-jetson-devices/95)
  
License
-------

The project is licensed under the Apache 2.0 license.

Photo by <a href="https://unsplash.com/@melodyp?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Mélody P</a> on <a href="https://unsplash.com/photos/thunder-through-field-wFN9B3s_iik?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

