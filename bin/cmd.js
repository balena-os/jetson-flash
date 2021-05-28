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

const run = async options => {
	const stat = await statAsync(options.file);

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

	const Flasher = new ResinJetsonFlash(
		options.machine,
		options.file,
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
		choices: ['jetson-tx2', 'jetson-tx2-4GB', 'jetson-nano-emmc', 'jetson-nano-qspi-sd', 'jetson-xavier', 'jetson-xavier-nx-devkit-emmc', "jetson-xavier-nx-devkit"],
		required: true,
		type: 'string',
	})
	.alias('f', 'file')
	.nargs('f', 1)
	.describe('f', 'BalenaOS image to use')
	.demandOption(['f'])
	.alias('o', 'output')
	.nargs('o', 1)
	.describe('o', 'Output directory')
	.alias('p', 'persistent')
	.boolean('p')
	.describe('p', 'Persist work')
	.implies('p', 'o')
	.example('$0 -f balena.img -p -o ./workdir', '')
	.help('h')
	.alias('h', 'help')
	.epilog('Copyright 2020').argv;

run(argv);
