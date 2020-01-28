/*
 * @Author: czy0729
 * @Date: 2020-01-26 18:06:07
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-29 03:02:10
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const quality = 'g'

const filePaths = []
function findJsonFile(path) {
  const ids = JSON.parse(fs.readFileSync(path))
  ids.forEach(item =>
    filePaths.push(
      `../Bangumi-Subject/data/${Math.floor(item / 100)}/${item}.json`
    )
  )
}
findJsonFile('../Bangumi-Subject/ids/anime-bangumi-data.json')
// console.log(filePaths)

let images = []
filePaths.forEach(item => {
  const { crt } = JSON.parse(fs.readFileSync(item))
  if (!crt) {
    return
  }
  crt.forEach(i => {
    images.push(i.image)
  })
})
const covers = Array.from(new Set(images))

async function downloadImage(image) {
  return new Promise((resolve, reject) => {
    if (image === 'undefined') {
      return resolve(true)
    }

    const hash = utils.hash(`https:${image}`)
    const filePath = `./data/character/${quality}/${hash
      .slice(0, 1)
      .toLowerCase()}/${hash}.jpg`
    if (fs.existsSync(filePath)) {
      // console.log(`- skip ${image}`)
      return resolve(true)
    }

    const src = `http:${image}`
    console.log(
      `- write ${image} [${covers.indexOf(image)} / ${covers.length}]`
    )
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', chunk => (imgData += chunk))
      req.on('end', () => {
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        fs.writeFileSync(filePath, imgData, 'binary', err => {
          if (err) console.log('- error ${image}')
        })

        resolve(true)
      })
    })
  })
}

const fetchs = covers.map(item => () => downloadImage(item))
utils.queue(fetchs, 6)
