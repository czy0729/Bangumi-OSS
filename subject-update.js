/*
 * @Author: czy0729
 * @Date: 2020-01-17 21:10:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-04-17 03:15:21
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const ids = 'anime-bangumi-data'

const filePaths = []
function findJsonFile(path) {
  const ids = JSON.parse(fs.readFileSync(path))
  ids.forEach((item) =>
    filePaths.push(
      `../Bangumi-Subject/data/${Math.floor(item / 100)}/${item}.json`
    )
  )
}
findJsonFile(`../Bangumi-Subject/ids/${ids}.json`)

const covers = Array.from(
  new Set(
    filePaths
      .map((item) => {
        try {
          return String(JSON.parse(fs.readFileSync(item)).image).replace(
            '/m/',
            '/c/'
          )
        } catch (error) {}
      })
      .filter((item) => !!item)
  )
)

async function downloadImage(image) {
  return new Promise((resolve, reject) => {
    if (image === 'undefined') {
      return resolve(true)
    }

    const hash = utils.hash(`https:${image}`)
    const filePath = `./data/subject/c/${hash
      .slice(0, 1)
      .toLowerCase()}/${hash}.jpg`
    if (
      fs.existsSync(filePath) ||
      fs.existsSync(
        `./data/subject/l-update/${hash.slice(0, 1).toLowerCase()}/${hash}.jpg`
      )
    ) {
      return resolve(true)
    }

    const src = `http:${image}`.replace('/c/', '/l/')
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', (chunk) => (imgData += chunk))
      req.on('end', () => {
        const newFilePath = filePath.replace('/c/', /l-update/)
        const dirPath = path.dirname(newFilePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(newFilePath, imgData, 'binary', (err) => {
          if (err) console.log('- error ${image}')
        })

        console.log(
          `- write ${src} [${covers.indexOf(image)} / ${covers.length}]`
        )
        resolve(true)
      })
    })
  })
}

const fetchs = covers.map((item) => () => downloadImage(item))
utils.queue(fetchs, 20)
