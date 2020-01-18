/*
 * @Author: czy0729
 * @Date: 2020-01-17 21:10:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-18 14:39:38
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const quality = 'm'

const filePaths = []
function findJsonFile(path) {
  fs.readdirSync(path).forEach((item, index) => {
    const fPath = join(path, item)
    const stat = fs.statSync(fPath)
    if (stat.isDirectory() === true) {
      findJsonFile(fPath)
    }
    if (stat.isFile() === true) {
      filePaths.push(fPath)
    }
  })
}
findJsonFile('../Bangumi-Rakuen/data/topic')
// console.log(filePaths)

const avatars = Array.from(
  new Set(filePaths.map(item => JSON.parse(fs.readFileSync(item)).avatar))
)
// console.log(avatars)

async function downloadAvatar(avatar) {
  return new Promise((resolve, reject) => {
    const hash = utils.hash(`https:${avatar}`)
    const filePath = `./data/avatar/${quality}/${hash
      .slice(0, 1)
      .toLowerCase()}/${hash}.jpg`
    if (fs.existsSync(filePath)) {
      console.log(`- skip ${avatar}`)
      return resolve(true)
    }

    const src = `http:${avatar}`
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', chunk => (imgData += chunk))
      req.on('end', () => {
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        console.log(
          `- write ${avatar} [${avatars.indexOf(avatar)} / ${avatars.length}]`
        )
        fs.writeFileSync(filePath, imgData, 'binary', err => {
          if (err) console.log('- error ${avatar}')
        })

        resolve(true)
      })
    })
  })
}

const fetchs = avatars.map(item => () => downloadAvatar(item))
utils.queue(fetchs, 4)
