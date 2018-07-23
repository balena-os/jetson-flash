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
 * See the License for the specific language governing permissions and * limitations under the License.
 */

'use strict'

const _ = require('lodash')
const Bluebird = require('bluebird')
const bz2 = require('unbzip2-stream')
const filedisk = require('file-disk')
const fs = Bluebird.promisifyAll(require('fs'))
const fse  = require('fs-extra')
const GPT = require('gpt')
const hasha = require('hasha')
const makeDir = require('make-dir')
const partitionInfo = require('partitioninfo')
const streamToString = require('stream-to-string')
const tar = require('tar-fs')

const {
  SpinnerPromise
} = require('resin-cli-visuals')
const {
  spawnSync
} = require('child_process')
const {
  join,
  dirname,
  basename
} = require('path')
const {
  get
} = require('request')

const readFromDisk = async (disk, offset, size) => {
  const buff = await disk.read(Buffer.alloc(size), 0, size, offset)
  return buff.buffer
}

const writePath = async (file, output) => {
  const mode = file.mode & ~process.umask()
  const dest = join(output, file.path)
  const dir = await makeDir(dirname(dest))

  if (file.type === 'directory') {
    return
  }

  if (file.type === 'link') {
    return fs.linkAsync(file.linkname, dest)
  }

  if (file.type === 'symlink') {
    return fs.symlinkAsync(file.linkname, dest)
  }

  return fs.writeFileAsync(dest, file.data, {
    mode
  })
}

const getPartitionTableWithNames = async (image) => {
  const MBR_SIZE = 512
  const GPT_SIZE = 512 * 33

  const rawTable = await Bluebird.using(filedisk.openFile(image, 'r'), async (fd) => {
    return GPT.parse(await readFromDisk(new filedisk.FileDisk(fd), MBR_SIZE, GPT_SIZE))
  })
  const partTable = await partitionInfo.getPartitions(image)

  partTable
    .partitions
    .forEach((partition, i) => {
      partition.name = rawTable.partitions[i].name
    })

  return partTable
}

const fileHash = (file) => {
  return hasha.fromFile(file, {
    algorithm: 'sha1'
  })
}

const dirHash = (dir) => {
  return streamToString(tar.pack(dir)
    .pipe(hasha.stream({
        algorithm: 'sha1'
      })
    )
  )
}

const imageStampPath = (output) => {
  return join(output, 'stamp')
}
const dirStampPath = (output) => {
  return `${output}.stamp`
}

const checkOutputDir = (output) => {
  return fs.statAsync(dirStampPath(output))
    .then(async () => {
      return (await fs.readFileAsync(dirStampPath(output))).toString() === await dirHash(output)
    })
    .catch({
      code: 'ENOENT'
    }, () => {
      return false
    })
}

const checkImage = async (output, image) => {
  return new SpinnerPromise({
    promise: fs.statAsync(dirStampPath(output))
      .then(async () => {
        return (await fs.readFileAsync(imageStampPath(output))).toString() === await fileHash(image)
      })
      .catch({
        code:'ENOENT'
      }, () => {
        return false
      }),
    startMessage: `Checking image cache for ${image}`,
    stopMessage: `Cache image check done`
  })
}

exports.sudoRm = (output) => {
  spawnSync('sudo', ['rm', '-r', output], {
    stdio: 'inherit'
  })
}

exports.outputRegister = async (output, persistent) => {
  await fse.ensureDir(output)

  if (!persistent) {
    process.on('SIGINT', () => {
      process.exit()
    })
    process.on('exit', () => {
      spawnSync('rm', ['-r', output], {
          stdio: 'inherit'
        })
    })
  }
}

exports.extractPartition = async (image, partitionName, output) => {
  console.log(`Extracting partition ${partitionName} from ${image} to ${output}`)

  const partition = (await getPartitionTableWithNames(image))
    .partitions
    .find((part) => {
      return part.name === partitionName
    })

  const path = join(output, partition.name)
  const read = fs.createReadStream(image, {
    start: partition.offset,
    end: partition.offset + partition.size - 1
  })
  const write = fs.createWriteStream(path)

  return new Bluebird((resolve, reject) => {
    read.pipe(write)
    read.on('end', () => {
      resolve(path)
    })
    read.on('error', reject)
  })
}

exports.decompressTbz2FromUrl = (url, output) => {
  return new SpinnerPromise({
    promise: new Bluebird((resolve, reject) => {
      const stream = tar.extract(output)
      stream.on('error', reject)
      stream.on('finish', resolve)
      get(url)
        .pipe(bz2())
        .pipe(stream)
    }),
    startMessage: `Downloading and extracting ${url}`,
    stopMessage: `Saved in ${output}`
  })
}

exports.checkConsistency = async (dir) => {
  const result = await new SpinnerPromise({
    promise: checkOutputDir(dir),
    startMessage: `Checking artifact consistency for ${dir}`,
    stopMessage: `Consistency check done for ${dir}`
  })

  if (!result) {
    await fse.remove(dir)
    await fse.emptyDir(dir)
  }

  return result
}

exports.cached = async (output, image) => {
  console.log('Checking resin cache')

  const result = await checkImage(output, image) && await exports.checkConsistency(output)

  if (!result) {
    await fse.remove(imageStampPath(basename(output)))
    await fse.emptyDir(output)
  }

  return result
}

exports.generateStamp = async (dir) => {
  return fs.writeFileAsync(dirStampPath(dir), await new SpinnerPromise({
    promise: dirHash(dir),
    startMessage: `Generate hash for ${dir}`,
    stopMessage: `Successfully generated hash`
  }))
}

exports.generateCache = async (output, image) => {
  await fs.writeFileAsync(imageStampPath(output), await fileHash(image))
  await exports.generateStamp(output)
}
