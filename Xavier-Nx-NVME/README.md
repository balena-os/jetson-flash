# Run flasher from Windows
- Install WSL
	- [Install WSL | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/install)
- Install Docker Desktop
	- [Install Docker Desktop on Windows | Docker Documentation](https://docs.docker.com/desktop/install/windows-install/)
- Install Usbipd
	- [Connect USB devices | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/connect-usb)
- Install BalenaEtcher
	- [balenaEtcher - Flash OS images to SD cards & USB drives](https://etcher.balena.io/#download-etcher)
- Reboot

## Start Docker Desktop
Settings -> Resources -> WSL Integration 
- Enable toggle button for your WSL distro
- Apply & restart
## Route the serial port from Xavier to WSL
Get the ID of the serial port that you want to pass through with Usbipd. It will be something like 2-1 or 1-3
``` Powershell
usbipd wsl list
```
Attach the relevant Bus ID to WSL
``` Powershell
usbipd wsl list
usbipd wsl attach --auto-attach --busid <bus ID>
```

## Open Windows Terminal and start Ubuntu WSL
Verify that docker works
``` bash
docker
```
You should see output with usage information for docker
## Download flashing Docker image
Log in to our container registry in Azure to access the image
``` bash 
docker login -u dronevolt -p HHbHLxDT4rCQJz8dKHkFKFYLW1RN248LW0k5ERbT2q+ACRAmK9e
docker pull dronevolt.azurecr.io/balena-flasher
```
## Run the flasher container from Ubuntu WSL
From the ubuntu terminal you need to run the following command to start the container with the necessary privileges:
``` bash
docker container run --rm -it --privileged -v /dev/:/dev/ -v ~/images:/data/images dronevolt.azurecr.io/balena-flasher:latest /bin/bash
```
This will open up a terminal inside the container with the flashing script and the zipped image that we are flashing to the device.

Unzip the image into a folder we can access from Windows
``` bash
unzip dv-kbr-flasher-kobra-fleet.zip -d /data/images
```
# Open a new Ubuntu WSL terminal
Go to the directory where we put the image and open explorer.exe so we can get the path to the image.
``` bash
cd ~/images
explorer.exe .
```
Copy the image (dv-kbr-flasher-kobra-fleet.img) to the Desktop or somewhere you can easily find it. You can also just copy the directory path at the top if you want.
## Flash image to USB Drive
- Open BalenaEtcher
- Click 'Flash from file'
- Find the dv-kbr-flasher-kobra-fleet.img that we copied just before and select it
- Click 'Select target'
- Select the USB drive
- Click 'Flash'

## Prepare Xavier for flashing
- Insert the now flashed USB drive into one of the Xavier USB ports
- Add a jumper to put it into recovery mode
- Power on the Xavier

## Run the flashing script from the container
Run the following command to start the flashing process:
``` bash
./flash_xavier-nx.sh -f /data/images/dv-kbr-flasher-kobra-fleet.img --accept-license yes
```

Once the script finishes, the Xavier will reboot. The fan will start spinning and the bootloader will be flashed from the USB to QSPI memory. It will turn off automatically once it completes. 

# Flash from Linux
You can see more details to some of these steps in the Windows installation section

- Install Docker
- Download the Docker flasher image from the Azure container registry
- Run the container with the special command
- Find the img file in the ~/images folder
- Flash it to a USB drive
- Insert USB drive into the Xavier and boot it in recovery mode
- Run `./flash_xavier_nx.sh -f /data/images/<image-name> --accept-license yes` from the flashing container
- Once the script finishes, the Xavier will boot. The fan will start spinning and the bootloader will be flashed from the USB to QSPI memory. It will turn off automatically once it completes. 
- Remove the USB drive and the recovery mode jumper and start the Xavier
- It should now boot into balena

# Use a custom image 
If you have an img file with an OS that is not baked into the flashing container, you need to make sure that it is copied into the ~/images folder, so it is available inside the container. Other than that, the steps are the same. You need to flash the img to a USB drive and run the script in the flashing container with the same image. Then you just wait for the flashing to finish and the device to turn off.
