#!/bin/bash

set -e

balena_image_flasher_root_mnt="/tmp/flash-bootA"
balena_image_loop_dev=""
lt_dir="Linux_for_Tegra"
work_dir="/usr/src/app/orin-nx-flash/"

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
    echo "Provisioning can be started by typing:\n $ ./flash_orin_nx.sh -f /data/images/<balenaOS.img>"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
	arg="$1"
	case $arg in
		-h|--help)
			help
			exit 0
			;;
		-f|--balena-image-flasher)
			if [ -z "$2" ]; then
				log ERROR "\"$1\" argument needs a value."
			fi
			balena_image_flasher=$2
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

cleanup () {
	exit_code=$?
	umount $balena_image_flasher_root_mnt > /dev/null 2>&1 || true
	losetup -d $balena_image_flasher_loop_dev > /dev/null 2>&1 || true
	losetup -D
	if [[ $exit_code -eq 0 ]]; then
		log "Once the device's fan starts spinning USB provisioning is started."
		log "The internal flashing process takes around 10-15 minutes as the internal QSPI memory is flashed, please wait for the device to finish provisioning and to power itself off."
	fi
}

# Minimal changes needed to boot balenaOS kernel with the BSP flasher tools.
# Once the kernel starts running, it will boot the flasher image on the USB stick plugged in the Orin NX.
function setup_orin_nx_rcmboot() {
    echo "" > "${lt_dir}/bootloader/l4t_initrd.img"
    echo "" > "${lt_dir}/tools/ota_tools/version_upgrade/recovery_copy_binlist.txt"
    echo "" > "${lt_dir}/tools/ota_tools/version_upgrade/ota_make_recovery_img_dtb.sh"
    cp "${lt_dir}/kernel/dtb/tegra234-p3767-0000-p3509-a02.dtb" "${lt_dir}/bootloader/tegra234-p3767-0000-p3509-a02.dtb.rec"
    echo " " > "${lt_dir}/bootloader/recovery.img"
    sed -i 's/console=ttyAMA0,115200/root=LABEL=flash-rootA flasher /g' "${lt_dir}/p3767.conf.common"
}

trap cleanup EXIT SIGHUP SIGINT SIGTERM

# Unpack BSP archive if the Linux_for_Tegra has been removed
if [ ! -d $work_dir/$lt_dir ]; then
    tar xf *.tbz2
fi

# Extract balenaOS kernel from the flasher image and place it inside the BSP folder to be loaded by tegra rcmboot
balena_image_flasher_loop_dev="$(losetup -fP --show "$balena_image_flasher")"
mkdir -p $balena_image_flasher_root_mnt > /dev/null 2>&1 || true
mount "${balena_image_flasher_loop_dev}p2" "$balena_image_flasher_root_mnt" #> /dev/null 2>&1
rm "${lt_dir}/bootloader/boot0.img" || true
cp "${balena_image_flasher_root_mnt}/boot/Image" "${lt_dir}/kernel/Image"
log "Kernel image has been extracted and it the BSP kernel has been replaced with the one in balenaOS"

setup_orin_nx_rcmboot

# Prepare boot binaries. We use mmcblk0p1 as a dummy root to make the flash.sh script happy. This argument is not used during actual flashing.
# p3509-a02+p3767-0000 is the machine name used for the Orin NX in Xavier NX Devkit carrier board.
cd "${work_dir}/${lt_dir}"
sudo ./flash.sh --no-flash --rcm-boot p3509-a02+p3767-0000 mmcblk0p1

# Trigger rcmboot. The balenaOS kernel will boot the flasher image on the USB stick and provision the device.
cd "${work_dir}/${lt_dir}/bootloader"
sudo bash ./flashcmd.txt

