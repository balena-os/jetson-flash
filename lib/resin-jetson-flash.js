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

const _ = require('lodash')
const Bluebird = require('bluebird')
const convert = require('xml-js')
const str = require('string-to-stream')
const fs = Bluebird.promisifyAll(require('fs'))

const {
  copy
} = require('fs-extra')
const {
  tmpdir
} = require('os')
const {
  join,
} = require('path')
const {
  spawn
} = require('child_process')
const {
  SpinnerPromise
} = require('resin-cli-visuals')
const {
  unwrapResinImageFlasher
} = require('../scripts/resin-image-flasher-unwrap.js')

const resinPartitions = [
  'kernel',
  'kernel-dtb',
  'resin-boot',
  'resin-rootA',
  'resin-rootB',
  'resin-state',
  'resin-data'
]

const utils = require('./utils.js')

module.exports = class ResinJetsonFlash  {
  constructor (deviceType, image, assetDir, toolUrl, output) {
    this.deviceType = deviceType
    this.image = image
    this.assetDir = assetDir
    this.toolUrl = toolUrl
    this.output = output
  }

  spawnFlash (output) {
    return new Bluebird(async (resolve, reject) => {
      const workPath = join(tmpdir(), 'Linux_for_Tegra')

      await copy(join(output, 'Linux_for_Tegra'), workPath)
      process.chdir(workPath)

      const child = spawn('sudo', [
        './flash.sh',
        '-c', join(output, 'flash.xml'),
        this.deviceType,
        'mmcblk0p12'
      ], {
        stdio: 'inherit'
      })

      child.on('error', () => {
        utils.sudoRm(workPath)
        reject()
      })
      child.on('exit', () => {
        utils.sudoRm(workPath)
        resolve()
      })
    })
  }

  async injectFilepathInFlashXML (options) {
    const xml = await fs.readFileAsync(options.file)
    const result = convert.xml2js(xml)
    const stream = fs.createWriteStream(options.output)

    result
      .elements
      .find((value) => {
        return value.name === 'partition_layout'
      })
      .elements
      .find((value) => {
        return value.attributes.type === 'sdmmc_user'
      })
      .elements
      .filter((value) => {
        return value.name === 'partition' && Object.keys(options.partitions).includes(value.attributes.name)
      })
      .forEach((value) => {
        value
          .elements
          .filter((element) => {
            return element.name === 'filename'
          })
          .forEach((element) => {
            element
              .elements
              .forEach((filename) => {
                filename.text = options.partitions[value.attributes.name]
              })
          })
      })

    return new Bluebird((resolve, reject) => {
      const read = str(convert.js2xml(result, {
        spaces: 4
      }))

      read.pipe(stream)

      read.on('end', () => {
        resolve(options.output)
      })
      read.on('error', reject)
    })
  }

  async generateArtifacts () {
    const unwrappedImage = await unwrapResinImageFlasher(this.image, join(this.output, 'img'))
    const partitionsWithPath = _.zipObject(resinPartitions, await Bluebird.map(resinPartitions, async (partitionName) => {
      return utils.extractPartition(unwrappedImage, partitionName, this.output)
    }))

    await new SpinnerPromise({
      promise: utils.decompressTbz2FromUrl(this.toolUrl, this.output),
      startMessage: `Downloading and extracting ${this.toolUrl}`,
      stopMessage: `Saved in ${this.output}`
    })

    await this.injectFilepathInFlashXML({
      file: join(this.assetDir, 'resinOS-flash.xml'),
      output: join(this.output, 'flash.xml'),
      partitions: Object.assign(partitionsWithPath, {
        primary_gpt: join(this.assetDir, 'gpt_resin_primary.bin'),
        secondary_gpt: join(this.assetDir, 'gpt_resin_secondary.bin')
      })
    })
  }

  async flash () {
    await this.spawnFlash(this.output)
  }
}
