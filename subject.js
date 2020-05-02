/*
 * @Author: czy0729
 * @Date: 2020-01-17 21:10:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-05-02 19:01:57
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const quality = 'c'

const filePaths = []
function findJsonFile(path) {
  const ids = JSON.parse(fs.readFileSync(path))
  ids.forEach((item) =>
    filePaths.push(
      `../Bangumi-Subject/data/${Math.floor(item / 100)}/${item}.json`
    )
  )
}
findJsonFile('../Bangumi-Subject/ids/anime-2020.json')
// console.log(filePaths)

const covers = Array.from(
  new Set(
    filePaths.map((item) =>
      String(JSON.parse(fs.readFileSync(item)).image).replace('/m/', '/c/')
    )
  )
)
// console.log(covers)

async function downloadImage(image) {
  return new Promise((resolve, reject) => {
    if (image === 'undefined') {
      return resolve(true)
    }

    const hash = utils.hash(`https:${image}`)
    const filePath = `./data/subject/${quality}/${hash
      .slice(0, 1)
      .toLowerCase()}/${hash}.jpg`
    if (fs.existsSync(filePath)) {
      console.log(`- skip ${image}`)
      return resolve(true)
    }

    const src = `http:${image}`
    console.log(
      `- write ${image} [${covers.indexOf(image)} / ${covers.length}]`
    )
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', (chunk) => (imgData += chunk))
      req.on('end', () => {
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(filePath, imgData, 'binary', (err) => {
          if (err) console.log('- error ${image}')
        })

        resolve(true)
      })
    })
  })
}

const fetchs = covers.map((item) => () => downloadImage(item))
utils.queue(fetchs, 4)
