/*
 * @Author: czy0729
 * @Date: 2021-07-18 13:14:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-07-18 13:31:20
 */
const fs = require('fs')
const utils = require('./utils/utils')

const filePaths = []
function findJsonFile(path) {
  const ids = JSON.parse(fs.readFileSync(path))
  ids.forEach((item) =>
    filePaths.push(
      `../Bangumi-Subject/data/${Math.floor(item / 100)}/${item}.json`
    )
  )
}

findJsonFile('../Bangumi-Subject/ids/anime-rank.json')
findJsonFile('../Bangumi-Subject/ids/anime-2022.json')
findJsonFile('../Bangumi-Subject/ids/anime-2021.json')

const hashMap = {}
Array.from(
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
).forEach((image) => {
  const hash = utils.hash(`https:${image}`)
  hashMap[hash] = ''
})

const filePath = './hash/subject.min.json'
fs.writeFileSync(filePath, JSON.stringify(hashMap))
