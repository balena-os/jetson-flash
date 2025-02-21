#!/bin/bash

set -e

balena_image_flasher_root_mnt="/tmp/flash-rootA"
balena_image_loop_dev=""
lt_dir="Linux_for_Tegra"
device_dir="orin/"
work_dir="/usr/src/app/orin-flash/"
accept_license=""

function log {
	case $1 in
		ERROR)
			loglevel=ERROR
			shift
			;;
		WARN)
			loglevel=WARNING
			shift
			;;
		*)
		loglevel=LOG
			;;
	esac
	printf "%s%s\n" "[$loglevel] " "$1"
	if [ "$loglevel" == "ERROR" ]; then
		exit 1
	fi
}

function help() {
    echo "Provisioning can be started by typing:"
    echo " $ ./flash_orin.sh -f /data/images/<balenaOS.img> -m <device-type> --accept-license yes"
    echo "where <device-type> can be one of"
    echo "    jetson-agx-orin-devkit-64gb"
    echo "    jetson-orin-nx-xavier-nx-devkit"
    echo "    jetson-orin-nano-devkit-nvme"
    echo "    jetson-orin-nano-seeed-j3010"
    echo "    jetson-orin-nx-seeed-j4012"
    echo "    forecr-dsb-ornx-lan-orin-nano-4gb"
    echo "    forecr-dsb-ornx-lan-orin-nano-8gb"
    echo "    forecr-dsb-ornx-lan-orin-nx-16gb"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
	arg="$1"
	case $arg in
		-h|--help)
			help
			exit 0
			;;
		-m|--machine)
			if [ -z "$2" ]; then
				log ERROR "\"$1\" argument needs a value."
			fi
			balena_device_name=$2
			shift
			;;
		-f|--balena-image-flasher)
			if [ -z "$2" ]; then
				log ERROR "\"$1\" argument needs a value."
			fi
			balena_image_flasher=$2
			shift
			;;
		-l|--accept-license)
                        if [ -z "$2" ]; then
                                log ERROR "\"$1\" argument needs a value, which can be 'yes' or 'no'"
                        fi
			accept_license=$2
			shift
			;;
		*)
			echo "Unrecognized option $1."
			help
			exit 1
			;;
	esac
	shift
done


if [[ $balena_device_name = "jetson-orin-nano-devkit-nvme" ]]; then
	device_type="jetson-orin-nano-devkit"
	device_dtb="tegra234-p3768-0000+p3767-0005-nv.dtb"
elif [[ $balena_device_name = "jetson-orin-nano-seeed-j3010" ]]; then
	device_type="jetson-orin-nano-devkit"
	device_dtb="tegra234-p3768-0000+p3767-0004-nv.dtb"
elif [[ $balena_device_name = "forecr-dsb-ornx-lan-orin-nano-4gb" ]]; then
	device_type="jetson-orin-nano-devkit"
	device_dtb="tegra234-p3768-0000+p3767-0004-nv.dtb"
elif [[ $balena_device_name = "forecr-dsb-ornx-lan-orin-nano-8gb" ]]; then
	device_type="jetson-orin-nano-devkit"
	device_dtb="tegra234-p3768-0000+p3767-0003-nv.dtb"
elif [[ $balena_device_name = "forecr-dsb-ornx-lan-orin-nx-16gb" ]]; then
	device_type="jetson-orin-nano-devkit"
	device_dtb="tegra234-p3768-0000+p3767-0000-nv.dtb"
elif [[ $balena_device_name = "jetson-orin-nx-xavier-nx-devkit" ]] || [[ $balena_device_name = "jetson-orin-nx-seeed-j4012" ]]; then
	device_type="p3509-a02-p3767-0000"
	device_dtb="tegra234-p3768-0000+p3767-0000-nv.dtb"
elif [[ $balena_device_name = "jetson-agx-orin-devkit-64gb" ]]; then
	device_type="jetson-agx-orin-devkit"
	device_dtb="tegra234-p3737-0000+p3701-0005.dtb"
else
	log ERROR "Unknown or unspecified device-type!"
fi

cleanup () {
	exit_code=$?
	umount $balena_image_flasher_root_mnt > /dev/null 2>&1 || true
	losetup -d $balena_image_flasher_loop_dev > /dev/null 2>&1 || true
	losetup -D
	if [[ $exit_code -eq 0 ]]; then
		log "Once the device's fan starts spinning USB provisioning is started."
		log "The internal flashing process takes around 5-10 minutes as the internal QSPI memory is flashed, please wait for the device to finish provisioning and to power itself off."
		log "Once power LED turns off, remove the force recovery jumper if applicable as well as the provisioning USB KEY, then power on the device."
	fi
}

# Minimal changes needed to boot balenaOS kernel with the BSP flasher tools.
# Once the kernel starts running, it will boot the flasher image on the USB stick plugged in the Orin NX and Orin Nano.
function setup_orin_rcmboot() {
    echo "" > "${device_dir}${lt_dir}/bootloader/l4t_initrd.img"
    echo "" > "${device_dir}${lt_dir}/tools/ota_tools/version_upgrade/recovery_copy_binlist.txt"
    echo "" > "${device_dir}${lt_dir}/tools/ota_tools/version_upgrade/ota_make_recovery_img_dtb.sh"
    cp "${device_dir}${lt_dir}/kernel/dtb/${device_dtb}" "${device_dir}${lt_dir}/bootloader/${device_dtb}.rec"
    echo " " > "${device_dir}${lt_dir}/bootloader/recovery.img"
    mkdir -p "${device_dir}${lt_dir}/rootfs/boot/extlinux/"
    echo " " > "${device_dir}${lt_dir}/rootfs/boot/extlinux/extlinux.conf"
    sed -i 's/console=tty0/root=LABEL=flash-rootA flasher rootdelay=1 debug loglevel=7 roottimeout=360 jf_rcm_boot=1 /g' "${device_dir}${lt_dir}/p3767.conf.common"
    sed -i 's/console=tty0/root=LABEL=flash-rootA flasher rootdelay=1 debug loglevel=7 roottimeout=360 jf_rcm_boot=1 /g' "${device_dir}${lt_dir}/p3701.conf.common"
    # tegra234-mb2-bct-common.dtsi for AGX Orin and tegra234-mb2-bct-misc-p3767-0000.dts for Orin NX/Nano carrier boards which don't have eeproms
    sed -i 's/cvb_eeprom_read_size = <0x100>/cvb_eeprom_read_size = <0x0>/g' "${device_dir}${lt_dir}/bootloader/tegra234-mb2-bct-common.dtsi"
    sed -i 's/cvb_eeprom_read_size = <0x100>/cvb_eeprom_read_size = <0x0>/g' "${device_dir}${lt_dir}/bootloader/generic/BCT/tegra234-mb2-bct-misc-p3767-0000.dts"
}

trap cleanup EXIT SIGHUP SIGINT SIGTERM

# Unpack BSP archive if the Linux_for_Tegra has been removed
if [ ! -d ${work_dir}/${device_dir}/${lt_dir} ]; then
    tar xf *.tbz2
fi

cat "${work_dir}/${device_dir}/${lt_dir}/Tegra_Software_License_Agreement-Tegra-Linux.txt"
log "Above license agreement can be consulted at https://developer.download.nvidia.com/embedded/L4T/r36_Release_v3.0/release/Tegra_Software_License_Agreement-Tegra-Linux.txt?t=eyJscyI6ImdzZW8iLCJsc2QiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyJ9"

if [ "$accept_license" != "yes" ]; then
   echo "Accept the above License Agreement? Type yes/no:"
   read accept_license
   if [ "$accept_license" != "yes" ]; then
       log ERROR "License agreement must be accepted to use this tool"
   fi
fi

# Extract balenaOS kernel from the flasher image and place it inside the BSP folder to be loaded by tegra rcmboot
balena_image_flasher_loop_dev="$(losetup -fP --show "$balena_image_flasher")"
mkdir -p $balena_image_flasher_root_mnt > /dev/null 2>&1 || true
mount "${balena_image_flasher_loop_dev}p2" "$balena_image_flasher_root_mnt" #> /dev/null 2>&1
rm "${work_dir}/${device_dir}${lt_dir}/bootloader/boot0.img" || true
cp "${balena_image_flasher_root_mnt}/boot/Image" "${device_dir}/${lt_dir}/kernel/Image"
log "Kernel image has been extracted and the BSP kernel has been replaced with the one in balenaOS"

setup_orin_rcmboot

# Prepare boot binaries. We use mmcblk0p1 as a dummy root to make the flash.sh script happy. This argument is not used during actual flashing.
# p3509-a02+p3767-0000 is the machine name used for the Orin NX in Xavier NX Devkit carrier board.
cd "${work_dir}/${device_dir}${lt_dir}"
sudo ./flash.sh --no-flash $device_type mmcblk0p1
sudo ./flash.sh --rcm-boot $device_type mmcblk0p1
