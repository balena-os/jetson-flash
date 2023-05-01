/*
 * Copyright 2018 - 2020 Balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _ = require('lodash');
const Bluebird = require('bluebird');
const convert = require('xml-js');
const str = require('string-to-stream');
const fs = Bluebird.promisifyAll(require('fs'));
const mkdirp = require('mkdirp');

const { copy } = require('fs-extra');
const { tmpdir } = require('os');
const { join } = require('path');
const { spawn } = require('child_process');
const {
	unwrapResinImageFlasher,
} = require('../scripts/resin-image-flasher-unwrap.js');

const utils = require('./utils.js');
const path = require('path');
module.exports = class ResinJetsonFlash {
	constructor(deviceType, image, odmdata, assetDir, output) {
		this.deviceType = deviceType;
		this.image = image;
		this.odmdata = odmdata;
		this.assetDir = assetDir;
		this.output = output;
		this.dictionary = {
			['jetson-tx2']: {
				url:
					'https://developer.nvidia.com/downloads/remksjetpack-463r32releasev73t186jetsonlinur3273aarch64tbz2',
				partitions: {

					kernel: { path: null },
					kernel_b: { path: null },
					'bootloader-dtb': { path: null },
                                        'bootloader-dtb_b': { path: null },
					'kernel-dtb': { path: null },
					'kernel-dtb_b': { path: null },
					'resin-boot': { path: null },
					'resin-rootA': { path: null },
					'resin-rootB': { path: null },
					'resin-state': { path: null },
					'resin-data': { path: null },
				},
				medium: 'sdmmc_user',
			},
			['jetson-xavier-nx-devkit-tx2-nx']: {
                                url:
                                        'https://developer.nvidia.com/embedded/l4t/r32_release_v7.2/t186/jetson_linux_r32.7.2_aarch64.tbz2',
                                partitions: {

                                        kernel: { path: null },
                                        kernel_b: { path: null },
                                        'bootloader-dtb': { path: null },
                                        'bootloader-dtb_b': { path: null },
                                        'kernel-dtb': { path: null },
                                        'kernel-dtb_b': { path: null },
                                        'resin-boot': { path: null },
                                        'resin-rootA': { path: null },
                                        'resin-rootB': { path: null },
                                        'resin-state': { path: null },
                                        'resin-data': { path: null },
                                },
                                medium: 'sdmmc_user',
                        },
			['jetson-nano-emmc']: {
				url:
					'https://developer.nvidia.com/downloads/remetpack-463r32releasev73t210jetson-210linur3273aarch64tbz2',
				partitions: {
					LNX: { path: null },
					DTB: { path: null },
					RP1: { path: null },
					BMP: { path: null },
					'resin-boot': { path: null },
					'resin-rootA': { path: null },
					'resin-rootB': { path: null },
					'resin-state': { path: null },
					'resin-data': { path: null },
				},
				medium: 'sdmmc',
			},
			['jetson-nano-2gb-devkit']: {
                                url:
                                        'https://developer.nvidia.com/embedded/l4t/r32_release_v7.1/t210/jetson-210_linux_r32.7.1_aarch64.tbz2',
                                partitions: {
                                        LNX: { path: null },
                                        BMP: { path: null },
                                        'resin-boot': { path: null },
                                        'resin-rootA': { path: null },
                                        'resin-rootB': { path: null },
                                        'resin-state': { path: null },
                                        'resin-data': { path: null },
                                },
                                medium: ['sdcard', 'spi']
                        },
			['jetson-nano-qspi-sd']: {
				url:
					'https://developer.nvidia.com/embedded/l4t/r32_release_v7.2/t210/jetson-210_linux_r32.7.2_aarch64.tbz2',
				partitions: {
					LNX: { path: null },
					DTB: { path: null },
					RP1: { path: null },
					BMP: { path: null },
					'resin-boot': { path: null },
					'resin-rootA': { path: null },
					'resin-rootB': { path: null },
					'resin-state': { path: null },
					'resin-data': { path: null },
				},
				medium: ['sdcard', 'spi']
			},
			['jetson-xavier']: {
				url:
					'https://developer.nvidia.com/embedded/l4t/r32_release_v7.1/t186/jetson_linux_r32.7.1_aarch64.tbz2',
				partitions: {
					'bootloader-dtb': { path: null },
					'bootloader-dtb_b': { path: null },
					kernel: { path: null },
					kernel_b: { path: null },
					'kernel-dtb': { path: null },
					'kernel-dtb_b': { path: null },
					BMP: { path: null },
					BMP_b: { path: null },
					'bpmp-fw-dtb': { path: null },
					'bpmp-fw-dtb_b': { path: null },
					'resin-boot': { path: null },
					'resin-rootA': { path: null },
					'resin-rootB': { path: null },
					'resin-state': { path: null },
					'resin-data': { path: null },
				},
				medium: 'sdmmc_user',
			},
                        ['jetson-agx-orin-devkit']: {
                                url:
                                        'https://developer.nvidia.com/downloads/jetson-linux-r3521-aarch64tbz2',
                                partitions: {
					'resin-boot': { path: null },
                                        'resin-rootA': { path: null },
                                        'resin-rootB': { path: null },
                                        'resin-state': { path: null },
                                        'resin-data': { path: null },
                                },
                                medium: 'sdmmc_user',
                        },
			['jetson-xavier-nx-devkit-emmc']: {
                                url:
                                        'https://developer.nvidia.com/embedded/l4t/r32_release_v7.2/t186/jetson_linux_r32.7.2_aarch64.tbz2',
                                partitions: {
                                        kernel: { path: null },
                                        kernel_b: { path: null },
                                        'kernel-dtb': { path: null },
                                        'kernel-dtb_b': { path: null },
                                        'resin-boot': { path: null },
                                        'resin-rootA': { path: null },
                                        'resin-rootB': { path: null },
                                        'resin-state': { path: null },
                                        'resin-data': { path: null },
                                },
                                medium: 'sdmmc_user',
                        },
			['jetson-xavier-nx-devkit']: {
                                url:
                                        'https://developer.nvidia.com/downloads/remksjetpack-463r32releasev73t186jetsonlinur3273aarch64tbz2',
                                partitions: {
                                        kernel: { path: null },
                                        kernel_b: { path: null },
                                        'kernel-dtb': { path: null },
                                        'kernel-dtb_b': { path: null },
                                        'resin-boot': { path: null },
                                        'resin-rootA': { path: null },
                                        'resin-rootB': { path: null },
                                        'resin-state': { path: null },
                                        'resin-data': { path: null },
                                },
                                medium: 'sdcard',
                        },
		};
	}

	spawnFlash() {
		return new Bluebird(async (resolve, reject) => {
			const workPath = join(tmpdir(), 'Linux_for_Tegra');

			await copy(join(this.output, 'Linux_for_Tegra'), workPath);
			process.chdir(workPath);

			/* Create an empty extlinux.conf so that flash.sh won't fail */
			const extlinuxDir = mkdirp.sync(workPath + '/rootfs/boot/extlinux');
			fs.closeSync(fs.openSync(workPath + '/rootfs/boot/extlinux/extlinux.conf', 'w'));
			fs.mkdirSync(workPath + '/bootloader/', { recursive: true });
			fs.mkdirSync(workPath + '/tools/ota_tools/version_upgrade/', { recursive: true });
			fs.closeSync(fs.openSync(workPath + '/bootloader/recovery.img', 'w'));
			fs.writeFileSync(workPath + '/tools/ota_tools/version_upgrade/recovery_copy_binlist.txt', '');
			fs.writeFileSync(workPath + '/tools/ota_tools/version_upgrade/ota_make_recovery_img_dtb.sh', '');
			if ("jetson-xavier-nx-devkit-tx2-nx" == this.deviceType.toString()) {
				try {
					fs.copyFileSync(path.resolve(__dirname, '../Config_Files_For_KNG/tegra186-mb1-bct-pinmux-p3636-0001-a00_kng.cfg'),
								workPath + '/bootloader/t186ref/BCT/tegra186-mb1-bct-pinmux-p3636-0001-a00_kng.cfg');
					fs.copyFileSync(path.resolve(__dirname, '../Config_Files_For_KNG/tegra186-bpmp-p3636-0001-a00-00_kng.dtb'),
								workPath + '/bootloader/t186ref/tegra186-bpmp-p3636-0001-a00-00_kng.dtb');
					const tx2NxConfFile = join(workPath, '/p3636.conf.common');
					var tx2NxConf = fs.readFileSync(tx2NxConfFile, 'utf8');
					var replacedPinmux = tx2NxConf.replace(/tegra186-mb1-bct-pinmux-p3636-0001-a00.cfg/g, 'tegra186-mb1-bct-pinmux-p3636-0001-a00_kng.cfg');
					var replacedBpmp = replacedPinmux.replace(/tegra186-bpmp-p3636-0001-a00-00.dtb/g, 'tegra186-bpmp-p3636-0001-a00-00_kng.dtb');
					fs.writeFileSync(tx2NxConfFile, replacedBpmp, 'utf8');
					console.log("Updated KNG pinmux cfg and bpmp dtb in p3636.conf.common");
				} catch (err) {
					console.error(err);
				}
			}

			if ("jetson-agx-orin-devkit" == this.deviceType.toString()) {
					fs.copyFileSync(path.resolve(__dirname, '../AGX_Orin/bootloader/uefi_jetson.bin'), workPath + '/bootloader/uefi_jetson.bin');
					const flashfile = join(workPath, '/flash.sh');
					console.log('Fixing flash.sh for AGX Orin Devkit');
					try {
						var data = fs.readFileSync(flashfile, 'utf8');

						var result = data.replace(/limit_boot_chains \|/g, ' ');
						console.log("Fixed flash");
						fs.writeFileSync(flashfile, result, 'utf8');
					} catch (err) {
						console.error(err);
					}

					var dtsi = join(workPath, '/bootloader/tegra234-firewall-config-base.dtsi');
					var dtsiData = fs.readFileSync(dtsi, 'utf8').toString().split("\n");
					var replaceStr = "            exclusion-info = <0>;"
					const replaceArr = [2766, 2771, 2776, 2781, 2786, 2791, 2796, 2801, 2806, 2811, 2816, 2821, 2826, 2831, 25712, 25717, 25722, 25727, 25732, 25737, 25742, 25747, 25752, 25757, 25762, 25767];
					for (let i=0; i < replaceArr.length; i++) {
						dtsiData.splice(replaceArr[i], 1, replaceStr);
					}
					var replacedContents = dtsiData.join("\n");
					fs.writeFileSync(workPath + '/bootloader/tegra234-firewall-config-base.dtsi', replacedContents, 'utf8');
					dtsi = join(workPath, '/bootloader/tegra234-mb2-bct-common.dtsi');
					dtsiData = fs.readFileSync(dtsi, 'utf8');
					replacedContents = dtsiData.replace(/cvb_eeprom_read_size = <0x100>;/g, 'cvb_eeprom_read_size = <0x0>;');
					fs.writeFileSync(workPath + '/bootloader/tegra234-mb2-bct-common.dtsi', replacedContents, 'utf8');
			}

			if ("default" != this.odmdata.toString()) {
				if ("jetson-tx2" == this.deviceType.toString()) {
					/* flash.sh from the BSP has a bug which causes the -o argument
					 * to be ignored. Let's edit the configuration file to overcome this
					 */
					const odmfile = join(workPath, '/p2771-0000.conf.common');
					console.log('Using ODMDATA value: ' + this.odmdata.toString());
					try {
						var data = fs.readFileSync(odmfile, 'utf8');
						// Default ODMDATA configuration option in the BSP archive is #2 - 0x1090000
						var result = data.replace(/ODMDATA=0x1090000/g, 'ODMDATA=' +  this.odmdata.toString());
						console.log("Replaced ODMDATA in " + odmfile);
						fs.writeFileSync(odmfile, result, 'utf8');
					} catch (err) {
						console.error(err);
					}
				}
			} else {
				console.log("ODMDATA not specified, using default value set by BSP archive")
			}

			if (this.deviceType.toString().startsWith("jetson-xavier")) {
				try {
					fs.copyFileSync(this.assetDir + '/../cbo/cbo.dtb', workPath + '/bootloader/cbo.dtb');
				} catch (err) {
					console.error(err);
				}
			}

			const child = spawn(
				'sudo',
				[
					'bash',
					'./flash.sh',
					'-c',
					join(this.output, 'resin', 'flash.xml'),
					this.deviceType,
					'mmcblk0p12',
				],
				{
					stdio: 'inherit',
				},
			);

			child.on('error', () => {
				utils.sudoRm(workPath);
				reject();
			});
			child.on('exit', () => {
				utils.sudoRm(workPath);
				resolve();
			});
		});
	}

	async injectFilepathInFlashXML(options) {
		const xml = await fs.readFileAsync(options.file);
		const result = convert.xml2js(xml);
		const stream = fs.createWriteStream(options.output);

		result.elements
			.find(value => {
				return value.name === 'partition_layout';
			})
			.elements.filter(value => {
				return ( this.deviceType === 'jetson-nano-qspi-sd' || this.deviceType === 'jetson-nano-2gb-devkit' ?
					value.attributes.type === this.dictionary[this.deviceType].medium[0] || value.attributes.type === this.dictionary[this.deviceType].medium[1] :
					value.attributes.type === this.dictionary[this.deviceType].medium
				);
			})
			.forEach(value => {
				value.elements
					.filter(value => {
						return (
							value.name === 'partition' &&
							Object.keys(options.partitions).includes(value.attributes.name)
						);
					})
					.forEach(value => {
						value.elements
							.filter(element => {
								return element.name === 'filename';
							})
							.forEach(element => {
								element.elements.forEach(filename => {
									filename.text =
										options.partitions[value.attributes.name].path;
								});
							});
					});

				/* Data partition size will differ according to the preloaded image size,
				 * let's update the xml with the actual size in bytes. This is available
				 * only for the data partition.
				 */
				value.elements.
					filter(value => {
						return (
							value.name === 'partition' &&
							Object.keys(options.partitions).includes(value.attributes.name) &&
							value.attributes.name === 'resin-data'
						);
					})
					.forEach(value => {
						value.elements
							.filter(element => {
								return element.name === 'size';
							})
							.forEach(element => {
								element.elements.forEach(size => {
									size.text =
										options.partitions['resin-data'].size;
								});
							});
					});
			});

		return new Bluebird((resolve, reject) => {
			const read = str(
				convert.js2xml(result, {
					spaces: 4,
				}),
			);

			read.pipe(stream);

			read.on('end', () => {
				resolve(options.output);
			});
			read.on('error', reject);
		});
	}

	async generateArtifacts() {
		const nvidiaToolPath = join(this.output, 'Linux_for_Tegra');
		if (!(await utils.checkConsistency(nvidiaToolPath))) {
			await utils.decompressTbz2FromUrl(
				this.dictionary[this.deviceType].url,
				this.output,
			);
			await utils.generateStamp(nvidiaToolPath);
		} else {
			console.log('Using cached Linux_for_Tegra');
		}

		const resinImagePath = join(this.output, 'resin');
		if (!(await utils.cached(resinImagePath, this.image))) {
			const unwrappedImage = await unwrapResinImageFlasher(
				this.image,
				join(resinImagePath, 'img'),
			);

			for (const partition of Object.keys(
				this.dictionary[this.deviceType].partitions,
			)) {
				if (
					this.dictionary[this.deviceType].partitions[partition].path != null
				) {
					continue;
				}
				this.dictionary[this.deviceType].partitions[
					partition
				].path = await utils.extractPartition(
					unwrappedImage,
					partition,
					resinImagePath,
				);
			}

			const dataPartition = (await utils.getPartitionTableWithNames(
				unwrappedImage,
			)).partitions.find(part => {
				return part.name === 'resin-data';
			});
			console.log(`Data partition size in bytes: ${dataPartition.size}`);
			this.dictionary[this.deviceType].partitions['resin-data'].size = dataPartition.size;

			await this.injectFilepathInFlashXML({
				file: join(this.assetDir, 'resinOS-flash.xml'),
				output: join(resinImagePath, 'flash.xml'),
				partitions: this.dictionary[this.deviceType].partitions,
			});

			await utils.generateCache(resinImagePath, this.image);
		} else {
			console.log('Using cached resin image');
		}
	}

	async run() {
		await this.generateArtifacts();
		await this.spawnFlash();
	}
};
