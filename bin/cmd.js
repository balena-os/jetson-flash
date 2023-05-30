#!/usr/bin/env node

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

const Bluebird = require('bluebird');
const path = require('path');
const yargs = require('yargs');
const { statAsync } = Bluebird.promisifyAll(require('fs'));
const { tmpdir } = require('os');

const utils = require('../lib/utils.js');
const ResinJetsonFlash = require('../lib/resin-jetson-flash.js');
const fileSys = require('fs');
const filePath = require('path');
const readline = require("readline");

const run = async options => {
	const stat = await statAsync(options.file);
	console.log(filePath.resolve(__dirname, '../Tegra_Software_License_Agreement-Tegra-Linux.txt'));
	var tegraLicenseText = fileSys.readFileSync(path.resolve(__dirname, '../Tegra_Software_License_Agreement-Tegra-Linux.txt'), 'utf8');
	console.log(tegraLicenseText);
	console.log("The above License Agreement can be consulted at https://developer.download.nvidia.com/embedded/L4T/r35_Release_v2.1/release/Tegra_Software_License_Agreement-Tegra-Linux.txt");
	if (options.acceptLicense != 'yes') {
		const rl = readline.createInterface({
		    input: process.stdin,
		    output: process.stdout,
		});

		const response = await new Promise(resolve => { rl.question('Accept the Tegra Software License Agreement above? Type yes/no:', resolve)});
		rl.close();
		if (response != 'yes') {
			console.log('Tegra Software License Agreement for Tegra Linux needs to be accepted to use this tool.');
			process.exit(0);
		}
	}
	if (!stat.isFile()) {
		throw new Error('Specified image is not a file');
	}

	options.output = options.output || tmpdir();

	if (!path.isAbsolute(options.output)) {
		options.output = path.join(process.cwd(), options.output);
	}

	const outputPath = options.persistent
		? path.join(options.output, 'jetson-flash-artifacts')
		: path.join(options.output, process.pid.toString());

	await utils.outputRegister(outputPath, options.persistent);

	const odmdata = options.odmdata ? options.odmdata : 'default';

	const Flasher = new ResinJetsonFlash(
		options.machine,
		options.file,
		odmdata,
		`${__dirname}/../assets/${options.machine}-assets`,
		outputPath,
	);

	await Flasher.run();
};

const argv = yargs
	.usage('Usage: $0 [options]')
	.option('m', {
		alias: 'machine',
		description: 'Machine to flash',
		choices: ['jetson-tx2', 'jetson-tx2-4GB', 'jetson-xavier-nx-devkit-tx2-nx', 'jetson-nano-emmc', 'jetson-nano-qspi-sd', 'jetson-nano-2gb-devkit', 'jetson-xavier', 'jetson-xavier-nx-devkit-emmc', "jetson-xavier-nx-devkit", "jetson-agx-orin-devkit"],
		required: true,
		type: 'string',
	})
	.alias('f', 'file')
	.nargs('f', 1)
	.describe('f', 'BalenaOS image to use')
	.option('d', {
		alias: 'odmdata',
		description: 'ODMDATA value, currently available for Jetson TX2 only',
		choices: ['0x1090000', '0x90000', '0x6090000', '0x7090000', '0x2090000', '0x3090000'],
		required: false,
		type: 'string',
	})
        .option('l', {
                alias: 'acceptLicense',
                description: 'Accept Tegra Software License Agreement for Linux Tegra? License agreement needs to be accepted to use this tool.',
                choices: ['yes', 'no'],
                required: false,
                type: 'string',
        })
	.alias('o', 'output')
	.nargs('o', 1)
	.describe('o', 'Output directory')
	.alias('p', 'persistent')
	.boolean('p')
	.describe('p', 'Persist work')
	.implies('p', 'o')
	.example('$0 -f balena.img -p -o ./workdir --acceptLicense yes', '')
	.help('h')
	.alias('h', 'help')
	.epilog('Copyright 2020').argv;

run(argv);
