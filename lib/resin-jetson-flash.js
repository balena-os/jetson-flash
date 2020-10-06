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

module.exports = class ResinJetsonFlash {
	constructor(deviceType, image, assetDir, output) {
		this.deviceType = deviceType;
		this.image = image;
		this.assetDir = assetDir;
		this.output = output;
		this.dictionary = {
			['jetson-tx2']: {
				url:
					'https://developer.nvidia.com/embedded/L4T/r32_Release_v4.3/t186ref_release_aarch64/Tegra186_Linux_R32.4.3_aarch64.tbz2',
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
					'https://developer.nvidia.com/embedded/L4T/r32_Release_v4.3/t210ref_release_aarch64/Tegra210_Linux_R32.4.3_aarch64.tbz2',
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
			['jetson-nano-qspi-sd']: {
				url:
					'https://developer.nvidia.com/embedded/L4T/r32_Release_v4.3/t210ref_release_aarch64/Tegra210_Linux_R32.4.3_aarch64.tbz2',
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
				medium: 'sdcard',
			},
			['jetson-xavier']: {
				url:
					'https://developer.nvidia.com/embedded/L4T/r32_Release_v4.3/t186ref_release_aarch64/Tegra186_Linux_R32.4.3_aarch64.tbz2',
				partitions: {
					'bootloader-dtb': { path: null },
					'bootloader-dtb_b': { path: null },
					kernel: { path: null },
					kernel_b: { path: null },
					'kernel-dtb': { path: null },
					'kernel-dtb_b': { path: null },
					BMP: { path: null },
					BMP_b: { path: null },
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
                                        'https://developer.nvidia.com/embedded/L4T/r32_Release_v4.3/t186ref_release_aarch64/Tegra186_Linux_R32.4.3_aarch64.tbz2',
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

			const child = spawn(
				'sudo',
				[
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
				return (
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
