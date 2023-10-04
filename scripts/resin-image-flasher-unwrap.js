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
const progressStream = require('progress-stream');
const balenafs = require('balena-image-fs');

const { createReadStream, createWriteStream } = require('fs');
const { getPartitions } = require('partitioninfo');
const { join } = require('path');
const { Progress } = require('resin-cli-visuals');
const pipeline = Bluebird.promisify(require('stream').pipeline);

const RESIN_FLASHER = {
	bootID: 1,
	rootfsID: 2,
	resinImagePath: '/opt/',
};

const EFI_CODES = {
	gpt: 'C12A7328-F81F-11D2-BA4B-00A0C93EC93B',
	mbr: '14',
};

const getResinImageFromFlasher = async (image, output) => {
	const RESIN_IMAGE_REGEX = new RegExp('^(resin|balena)-image.*\.(resin|balena)os-img');

	console.log(`Retrieve BalenaOS image from ${image}`);
	await balenafs.interact(image, RESIN_FLASHER.rootfsID, async fs => {
		const path = join(
			RESIN_FLASHER.resinImagePath,
			(await Bluebird.promisify(fs.readdir)(RESIN_FLASHER.resinImagePath)).find(value => {
				return RESIN_IMAGE_REGEX.test(value);
			}),
		);
		const size = (await Bluebird.promisify(fs.stat)(path)).size;
		const stream = fs.createReadStream(path);

		return new Bluebird((resolve, reject) => {
			const bar = new Progress(`Writing to ${output}`);
			const str = progressStream({
				length: size,
				time: 1000,
			});
			const out = createWriteStream(output);

			stream.pipe(str).pipe(out);

			stream.on('error', reject);
			stream.on('end', resolve);

			str.on('progress', update => {
				bar.update({
					percentage: update.percentage,
					eta: update.eta,
				});
			});
		});
	});
};

// FIXME This function needs to be reimplemented once the fatfs module is fixed
const copyResinConfigurationOver = async (flasherImage, resinImage) => {
	const paths = ['/config.json', '/system-connections', '/dispatcher.d', '/splash'];

	const findResinBootPart = async image => {
		const table = await getPartitions(image);
		return table.partitions.find(value => {
			return value.type === EFI_CODES[table.type];
		});
	};

	const createFSH = options => {
		const recurse = async (fs, path) => {
			const stat = await Bluebird.promisify(fs.stat)(path).catch(
				{
					code: 'ISDIR',
				},
				() => {
					return null;
				},
			);
			const node = {
				path,
			};

			if (stat === null || stat.isDirectory()) {
				const subpaths = await Bluebird.promisify(fs.readdir)(path);
				node.type = 'directory';
				node.mode = stat ? stat.mode : null;
				node.children = await Bluebird.map(subpaths, async p => {
					return await recurse(fs, join(path, p));
				});
			} else if (stat.isFile()) {
				node.type = 'file';
				node.mode = stat.mode;
			} else {
				throw new Error(`Unkown type for ${path}`);
			}
			return node;
		};

		return balenafs.interact(options.image, options.partition, fs => {
			return recurse(fs, options.path);
		});
	};

	const resinImageBootPartID = (await findResinBootPart(resinImage)).index;
	const performCopy = async paths => {
		await Bluebird.each(paths, async path => {
			await balenafs.interact(resinImage, resinImageBootPartID, async fs => {
				if (path.type === 'directory') {
					//We cannot create directories at the moment, so we skip this action
					await performCopy(path.children);
				}
			})

			if (path.type === 'file') {
				await balenafs.interact(flasherImage,  RESIN_FLASHER.bootID, async fsFlasher => {
					await balenafs.interact(resinImage,  resinImageBootPartID, async fsImage => {
						await pipeline(
							fsFlasher.createReadStream(path.path),
							fsImage.createWriteStream(path.path)
						)
					})
				})
			}
		});
	};

	console.log(
		`Copying resin configuration from ${flasherImage} to ${resinImage}`,
	);
	const toCopy = await Bluebird.map(
		paths,
		path => {
			return createFSH({
				image: flasherImage,
				partition: RESIN_FLASHER.bootID,
				path,
			}).catch(
				{
					code: 'NOENT',
				},
				() => {
					return null;
				},
			);
		},
		{
			concurrency: 1,
		},
	).filter(fsh => {
		return fsh !== null;
	});

	await performCopy(toCopy);
};

exports.unwrapResinImageFlasher = async (image, output) => {
	const table = await getPartitions(image);

	const files = await balenafs.interact(
		image,
		table.partitions.find(value => {
			return value.type === EFI_CODES[table.type];
		}).index,
		async fs => {
			return await Bluebird.promisify(fs.readdir)('/')
		}
	)

	if (files.includes('resin-image-flasher') || files.includes('balena-image-flasher')) {
		await getResinImageFromFlasher(image, output);
		await copyResinConfigurationOver(image, output);
	} else {
		await pipeline(createReadStream(image), createWriteStream(output));
	}

	return output;
};
