/*
 * @Author: czy0729
 * @Date: 2020-01-18 11:37:34
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-10-11 14:21:25
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
findJsonFile('./data/avatar/m')

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

const filePath = './hash/avatar.json'
fs.writeFileSync(filePath, JSON.stringify(hashMap))
