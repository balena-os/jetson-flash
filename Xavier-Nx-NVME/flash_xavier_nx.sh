#!/bin/bash

set -e

balena_image_flasher_root_mnt="/tmp/flash-bootA"
balena_image_loop_dev=""
lt_dir="Linux_for_Tegra"
device_dir=""
work_dir="/usr/src/app/xavier-nx-flash/"
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
    echo "Provisioning can be started by typing:\n $ ./flash_xavier_nx.sh -f /data/images/<balenaOS.img> --accept-license yes"
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

device_type="jetson-xavier-nx-devkit-emmc"
device_dir="xavier_nx/"
device_dtb="tegra194-p3668-all-p3509-0000.dtb"

cleanup () {
	exit_code=$?
	umount $balena_image_flasher_root_mnt > /dev/null 2>&1 || true
	losetup -d $balena_image_flasher_loop_dev > /dev/null 2>&1 || true
	losetup -D
	if [[ $exit_code -eq 0 ]]; then
		log "Once the device's fan starts spinning USB provisioning is started."
		log "The internal flashing process takes around 10-15 minutes as the internal QSPI memory is flashed, please wait for the device to finish provisioning and to power itself off."
		log "Once power LED turns off, remove the force recovery jumper and the provisioning USB KEY, then power on the device."
	fi
}

# Minimal changes needed to boot balenaOS kernel with the BSP flasher tools.
# Once the kernel starts running, it will boot the flasher image on the USB stick plugged in the Xavier NX 
function setup_xavier_rcmboot() {
    echo "" > "${device_dir}${lt_dir}/bootloader/l4t_initrd.img"
    echo "" > "${device_dir}${lt_dir}/tools/ota_tools/version_upgrade/recovery_copy_binlist.txt"
    echo "" > "${device_dir}${lt_dir}/tools/ota_tools/version_upgrade/ota_make_recovery_img_dtb.sh"
    cp "${device_dir}${lt_dir}/kernel/dtb/${device_dtb}" "${device_dir}${lt_dir}/bootloader/${device_dtb}.rec"
    echo " " > "${device_dir}${lt_dir}/bootloader/recovery.img"
    mkdir -p "${device_dir}${lt_dir}/rootfs/boot/extlinux/"
    echo " " > "${device_dir}${lt_dir}/rootfs/boot/extlinux/extlinux.conf"
    sed -i 's/console=tty0/root=LABEL=flash-rootA flasher firmware_class.path=\/etc\/firmware /g' "${device_dir}${lt_dir}/p3668.conf.common"
}

trap cleanup EXIT SIGHUP SIGINT SIGTERM

echo "${work_dir}/${device_dir}/${lt_dir}" 
# Unpack BSP archive if the Linux_for_Tegra has been removed
if [ ! -d ${work_dir}/${device_dir}/${lt_dir} ]; then
    tar xf *.tbz2
fi

cat "${work_dir}/${device_dir}/${lt_dir}/nv_tegra/LICENSE"
log "Above license agreement can be consulted at https://developer.download.nvidia.com/embedded/L4T/r35_Release_v2.1/release/Tegra_Software_License_Agreement-Tegra-Linux.txt"

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

setup_xavier_rcmboot

# Prepare boot binaries. We use mmcblk0p1 as a dummy root to make the flash.sh script happy. This argument is not used during actual flashing.
cd "${work_dir}/${device_dir}${lt_dir}"
sudo ./flash.sh --no-flash $device_type mmcblk0p1
sudo ./flash.sh --rcm-boot $device_type mmcblk0p1
