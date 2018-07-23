#!/usr/bin/env node

/*
 * Copyright 2018 resin.io
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

'use strict'

const Bluebird = require('bluebird')
const path  = require('path')
const yargs = require('yargs')
const {
  statAsync,
} = Bluebird.promisifyAll(require('fs'))
const {
  tmpdir
} = require('os')

const utils = require('../lib/utils.js')
const ResinJetsonFlash = require('../lib/resin-jetson-flash.js')

const run = async (options) => {
  const deviceType = 'jetson-tx2'
  const stat = await statAsync(options.file)

  if (!stat.isFile()) {
    throw new Error('Specified image is not a file')
  }

  options.output = options.output || tmpdir()

  if (!path.isAbsolute(options.output)) {
    options.output = path.join(process.cwd(), options.output)
  }

  const outputPath = options.persistent ?
    path.join(options.output, 'jetson-flash-artifacts') :
    path.join(options.output, process.pid.toString())

  await utils.outputRegister(outputPath, options.persistent)

  const Flasher = new ResinJetsonFlash(
    deviceType,
    options.file,
    `${__dirname}/../assets/${deviceType}-assets`,
    'http://developer.download.nvidia.com/embedded/L4T/r28_Release_v2.0/GA/BSP/Tegra186_Linux_R28.2.0_aarch64.tbz2',
    outputPath
  )

  await Flasher.run()
}

const argv = yargs
  .usage('Usage: $0 [options]')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'ResinOS image to use')
  .demandOption(['f'])
  .alias('o', 'output')
  .nargs('o', 1)
  .describe('o', 'Output directory')
  .alias('p', 'persistent')
  .boolean('p')
  .describe('p', 'Persist work')
  .implies('p', 'o')
  .example('$0 -f resin.img -p -o ./workdir', '')
  .help('h')
  .alias('h', 'help')
  .epilog('Copyright 2018')
  .argv

run(argv)
