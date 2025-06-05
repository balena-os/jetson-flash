#!/bin/bash

# Most devices are on the same L4T BSP as the Jetson TX2
DEVICE_TYPE="jetson-tx2"
JETSON_FLASH_BSP_URL="https://developer.nvidia.com/downloads/embedded/l4t/r32_release_v7.6/t186/jetson_linux_r32.7.6_aarch64.tbz2"

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
    echo "You can build and run the jetson-flash container using :\n $ ./build_and_run.sh -m [jetson-tx2|jetson-xavier-nx-devkit-tx2-nx|jetson-nano-emmc|jetson-nano-2gb-devkit|jetson-nano-qspi-sd|jetson-xavier|jetson-agx-orin-devkit|jetson-xavier-nx-devkit-emmc|jetson-xavier-nx-devkit"
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
			DEVICE_TYPE=$2
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


case "${DEVICE_TYPE}" in
        jetson-agx-orin-devkit)
            JETSON_FLASH_BSP_URL="https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v4.3/release/Jetson_Linux_r36.4.3_aarch64.tbz2"
            ;;
        jetson-nano-qspi-sd)
            JETSON_FLASH_BSP_URL="https://developer.nvidia.com/downloads/remetpack-463r32releasev73t210jetson-210linur3273aarch64tbz2"
            ;;
        jetson-nano-2gb-devkit)
            JETSON_FLASH_BSP_URL="https://developer.nvidia.com/embedded/l4t/r32_release_v7.1/t210/jetson-210_linux_r32.7.1_aarch64.tbz2"
            ;;
        jetson-nano-emmc)
            JETSON_FLASH_BSP_URL="https://developer.nvidia.com/downloads/remetpack-463r32releasev73t210jetson-210linur3273aarch64tbz2"
            ;;
        *)
            echo $"Using default L4T 32.7.6 BSP for Jetson TX2 ${JETSON_FLASH_BSP_URL}"
esac


# Build Dockerfile
docker build --build-arg bsp_url="${JETSON_FLASH_BSP_URL}" --build-arg device_type="${DEVICE_TYPE}" -t jetson-flash-image .
