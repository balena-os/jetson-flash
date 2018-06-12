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
const GPT = require('gpt')
const makeDir = require('make-dir')
const partitionInfo = require('partitioninfo')
const tar = require('tar-stream')

const {
  spawnSync
} = require('child_process')
const {
  join,
  dirname
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

exports.outputRegister = async (output) => {
  await fs.mkdirAsync(output).catch({
    code: 'EEXIST'
  }, _.noop)

  process.on('exit', () => {
    console.log(`Attempting to remove ${output}, please confirm!`)
    spawnSync('sudo', ['rm', '-rI', output], {
      stdio: 'inherit'
    })
  })
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
  return new Bluebird((resolve, reject) => {
    const extract = tar.extract()

    extract.on('error', reject)
    extract.on('finish', resolve)

    extract.on('entry', (header, stream, next) => {
      const chunk = []

      stream.on('data', (data) => {
        chunk.push(data)
      })
      stream.on('end', () => {
        const file = {
          data: Buffer.concat(chunk),
          mode: header.mode,
          mtime: header.mtime,
          path: header.name,
          type: header.type
        }

        if (header.type === 'symlink' || header.type === 'link') {
          file.linkname = header.linkname
        }

        writePath(file, output)
        next()
      })
    })

    get(url)
      .pipe(bz2())
      .pipe(extract)
  })
}
