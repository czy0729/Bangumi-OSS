/*
 * @Author: czy0729
 * @Date: 2020-01-27 05:56:16
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-27 05:56:44
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join

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
findJsonFile('./data/character/g')

const hashMap = {}
filePaths
  .map(item => {
    const splits = item.split('/')
    const key = splits[splits.length - 1].replace('.jpg', '')
    return key
  })
  .sort((a, b) => a.localeCompare(b))
  .forEach(item => {
    hashMap[item] = ''
  })

const filePath = './hash/character.json'
fs.writeFileSync(filePath, JSON.stringify(hashMap))
