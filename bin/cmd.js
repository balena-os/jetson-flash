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
const yargs = require('yargs')
const {
  statAsync,
} = Bluebird.promisifyAll(require('fs'))
const {
  tmpdir
} = require('os')
const {
  join
} = require('path')

const {
  unwrapResinImageFlasher
} = require('../scripts/resin-image-flasher-unwrap.js')
const utils = require('../lib/utils.js')
const ResinJetsonFlash = require('../lib/resin-jetson-flash.js')

const run = async (image) => {
  const stat = await statAsync(image)
  const outputPath = join(tmpdir(), process.pid.toString())
  const deviceType = 'jetson-tx2'

  await utils.outputRegister(outputPath)

  const Flasher = new ResinJetsonFlash(
    deviceType,
    `${__dirname}/../assets/${deviceType}-assets`,
    'http://developer.download.nvidia.com/embedded/L4T/r28_Release_v2.0/GA/BSP/Tegra186_Linux_R28.2.0_aarch64.tbz2',
    outputPath
  )

  if (!stat.isFile()) {
    throw new Error('Specified image is not a file')
  }

  const unwrappedImage = await unwrapResinImageFlasher(image, join(outputPath, 'resin.img'))
  await Flasher.flash(unwrappedImage)
}

const argv = yargs
  .usage('Usage: $0 [options]')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'ResinOS image to use')
  .demandOption(['f'])
  .example('$0 -f resin.img', '')
  .help('h')
  .alias('h', 'help')
  .epilog('Copyright 2018')
  .argv

run(argv.file)
