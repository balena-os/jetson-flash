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
|[Auvidea CNX100 Xavier NX](./docs/cnx100-xavier-nx.md) | L4T 32.5.1 |
|[Auvidea JN30B Nano](./docs/jn30b-nano.md) | L4T 32.7.6  |
|[CTI Photon Nano](./docs/photon-nano.md) | L4T 32.7.3 |
|[CTI Photon TX2 NX](./docs/photon-tx2-nx.md) | L4T 32.7.2 |
|[CTI Photon Xavier NX](./docs/photon-xavier-nx.md) | L4T 32.7.3 |
|[Jetson Nano eMMC](./docs/jetson-nano-emmc.md) | L4T 32.7.6 |
|[Jetson Nano SD-CARD Devkit](./docs/jetson-nano.md) | L4T 32.7.3 |
|[Jetson Nano 2GB Devkit](./docs/jetson-nano-2gb-devkit.md) | L4T 32.7.1 |
|[Jetson TX2](./docs/jetson-tx2.md) | L4T 32.7.6 |
|[Jetson TX2 NX (in Jetson Xavier NX Devkit)](./docs/jetson-tx2-nx-devkit.md) | L4T 32.7.3 |
|[Jetson AGX Xavier](./docs/jetson-xavier.md) | L4T 32.7.3 |
|[Jetson Xavier NX Devkit eMMC](./docs/jetson-xavier-nx-devkit-emmc.md) | L4T 32.7.3 |
|[Jetson Xavier NX Devkit SD-CARD](./docs/jetson-xavier-nx-devkit.md) | L4T 32.7.3 |
|[Jetson AGX Orin Devkit 32GB](./docs/jetson-agx-orin-devkit.md) | L4T 36.5.0 |
|[Jetson AGX Orin Devkit 64GB](./docs/jetson-agx-orin-devkit-64gb.md) | L4T 36.5.0 |
| [AVerMedia D315 AGX Orin 64GB](#avermedia-d315-agx-orin-64gb)                        | L4T 36.5.0          |
|[Jetson Orin Nano 8GB (SD) Devkit NVME](./docs/jetson-orin-nano-devkit-nvme.md) | L4T 36.5.0 |
|[Jetson Orin NX in Xavier NX Devkit NVME](./docs/jetson-orin-nx-xavier-nx-devkit.md) | L4T 36.5.0 |
|[Seeed reComputer J3010 4GB](./docs/jetson-orin-nano-seeed-j3010.md) | L4T 36.5.0 |
|[Seeed reComputer J4012 16GB](./docs/jetson-orin-nx-seeed-j4012.md) | L4T 36.5.0 |

**Don't see your device listed?**

- Use the closest match above to the Jetson module on your carrier board
- Reach out to us on the [balena Forums](https://forums.balena.io/c/share-questions-or-issues-about-balena-jetson-flash-which-is-a-tool-that-allows-users-to-flash-balenaos-on-nvidia-jetson-devices/95)

---

## AVerMedia D315 AGX Orin 64GB

The AVerMedia D315 uses an AGX Orin 64GB SoM (p3701) on a custom carrier board.
It is flashed using the `avermedia-d315-agx-orin-64gb` machine name. The balenaOS
image being flashed is built as `jetson-agx-orin-devkit-64gb` (the "fake devkit"
pattern) — this is intentional and must be preserved.

### What this tool does for the D315

Before invoking NVIDIA's `flash.sh`, the tool injects D315-specific files from the
AVerMedia BSP into the L4T tree:

- `jetson-agx-orin-d315ao.conf` — the carrier-board flash configuration
- D315 DTBs (`tegra234-p3737-0000+p3701-000{0,4,5,8}-nv-d315.dtb`)

No custom pinmux, MB2 BCT or ODMDATA overrides are needed — the D315 uses the
same values as the standard NVIDIA devkit.

### Prerequisites

1. A balenaOS flasher image built for `jetson-agx-orin-devkit-64gb`:

   ```
   balena-image-flasher-jetson-agx-orin-devkit-64gb.balenaos-img
   ```

2. The AVerMedia JetPack 6.2 BSP extracted on the host. You need the
   `Linux_for_Tegra` directory:

   ```
   /path/to/avermedia/JetPack_6.2_Linux_JETSON_desktop/Linux_for_Tegra/
   ```

3. The D315 board in USB recovery mode (power off / micro-USB cable connected
   to the host / press factory reset button + power on).

### Flashing

**On the host**, set the BSP path and start the container:

```bash
export AVERMEDIA_BSP_PATH=/path/to/avermedia/JetPack_6.2_Linux_JETSON_desktop/Linux_for_Tegra

cd Orin_Flash
./build_and_run.sh
```

`build_and_run.sh` will automatically bind-mount the BSP directory into the
container at `/data/avermedia-bsp` when `AVERMEDIA_BSP_PATH` is set.

**Inside the container**, run the flash script:

```bash
./flash_orin.sh \
    -f /data/images/balena-image-flasher-jetson-agx-orin-devkit-64gb.balenaos-img \
    -m avermedia-d315-agx-orin-64gb \
    --accept-license yes
```

### Ending

The flash script is meant for regular devkit device. In the AVerMedia case, it's to the same behavior.
If everything went fine, it will output something like :

```bash
[LOG] Once the device's fan starts spinning USB provisioning is started.
[LOG] The internal flashing process takes around 5-10 minutes as the internal QSPI memory is flashed, please wait for the device to finish provisioning and to power itself off.
[LOG] Once power LED turns off, remove the force recovery jumper if applicable as well as the provisioning USB KEY, then power on the device.
```

For AVerMedia, unplug the power cable and replug it. Once the fan stop spinning + LED is off, you can remove the USB stick and restart the board. It should be correctly flashed then.
