/*
 * @Author: czy0729
 * @Date: 2020-01-17 21:10:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-07-17 00:49:38
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const useCache = true
const rewrite = false

const quality = 'l'
const pathCache = './data/subject/temp.json'
const covers = getCovers()

const fetchs = covers.map((item) => () => downloadImage(item))
console.log('start download ...')

utils.queue(fetchs, 8)

function getCovers() {
  if (useCache) {
    return utils.read(pathCache)
  }

  const filePaths = []
  function findJsonFile(path) {
    const ids = JSON.parse(fs.readFileSync(path))
    ids.forEach((item) =>
      filePaths.push(
        `../Bangumi-Subject/data/${Math.floor(item / 100)}/${item}.json`
      )
    )
  }

  findJsonFile('../Bangumi-Subject/ids/agefans.json')
  findJsonFile('../Bangumi-Subject/ids/anime-2020.json')
  findJsonFile('../Bangumi-Subject/ids/anime-2021.json')
  findJsonFile('../Bangumi-Subject/ids/anime-2022.json')
  findJsonFile('../Bangumi-Subject/ids/anime-bangumi-data.json')
  findJsonFile('../Bangumi-Subject/ids/anime-rank.json')
  findJsonFile('../Bangumi-Subject/ids/book-rank.json')
  findJsonFile('../Bangumi-Subject/ids/music-rank.json')
  findJsonFile('../Bangumi-Subject/ids/game-rank.json')
  findJsonFile('../Bangumi-Subject/ids/real-rank.json')
  // findJsonFile('../Bangumi-Subject/ids/book-2020.json')
  // findJsonFile('../Bangumi-Subject/ids/book-2021.json')
  // findJsonFile('../Bangumi-Subject/ids/game-2020.json')
  // findJsonFile('../Bangumi-Subject/ids/game-2021.json')
  // findJsonFile('../Bangumi-Subject/ids/music-2020.json')
  // findJsonFile('../Bangumi-Subject/ids/music-2021.json')
  // findJsonFile('../Bangumi-Subject/ids/real-2020.json')
  // findJsonFile('../Bangumi-Subject/ids/real-2021.json')
  // findJsonFile('../Bangumi-Subject/ids/wk8-series.json')
  // findJsonFile('../Bangumi-Subject/ids/wk8.json')
  // findJsonFile('../Bangumi-Subject/ids/manga.json')

  const covers = Array.from(
    new Set(
      filePaths.map((item) => {
        try {
          return String(JSON.parse(fs.readFileSync(item)).image).replace(
            /\/(g|s|m|c|l)\//,
            '/c/'
          )
        } catch (ex) {
          return ''
        }
      })
    )
  ).filter((item) => !!item)
  utils.write(pathCache, covers)
  return covers
}

async function downloadImage(cover) {
  if (cover === 'undefined') {
    return true
  }

  const hash = utils.hash(`https:${cover}`)
  const filePath = `./data/subject/${quality}/${hash
    .slice(0, 1)
    .toLowerCase()}/${hash}.jpg`
  if (
    !rewrite &&
    (fs.existsSync(filePath) ||
      fs.existsSync(filePath.replace(`/${quality}/`, '/c/')))
  ) {
    return true
  }

  const src = `http:${cover}`.replace('/c/', `/${quality}/`)
  await utils.download(`${src}?r=${utils.getTimestamp()}`, filePath)
  console.log(src, `${covers.indexOf(cover)} / ${covers.length}`)
}
