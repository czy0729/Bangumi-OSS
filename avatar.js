/*
 * @Author: czy0729
 * @Date: 2020-01-17 21:10:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-03 01:09:43
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const useCache = true
const rewrite = false

const quality = 'l'
const pathCache = './data/avatar/temp.json'
const avatars = getAvatars()

const fetchs = avatars.map((item) => () => downloadAvatar(item))
console.log('start download ...')

utils.queue(fetchs, 12)

function getAvatars() {
  if (useCache) {
    return utils.read(pathCache)
  }

  const filePaths = []
  function findJsonFile(path) {
    fs.readdirSync(path).forEach((item, index) => {
      const fPath = join(path, item)
      const stat = fs.statSync(fPath)
      if (stat.isDirectory() === true) {
        findJsonFile(fPath)
      }
      if (stat.isFile() === true && !fPath.includes('.DS_Store')) {
        filePaths.push(fPath)
      }
    })
  }

  /**
   * Topic
   */
  findJsonFile('../Bangumi-Rakuen/data/topic')
  const avatarsTopic = Array.from(
    new Set(filePaths.map((item) => JSON.parse(fs.readFileSync(item)).avatar))
  )

  /**
   * Comment
   */
  findJsonFile('../Bangumi-Rakuen/data/comment')
  const temp = []
  filePaths.forEach((item) => {
    try {
      const data = JSON.parse(fs.readFileSync(item))
      data.forEach((item) => {
        if (item.avatar) {
          temp.push(item.avatar)
        }
        item.sub.forEach((i) => {
          if (i.avatar) {
            temp.push(i.avatar)
          }
        })
      })
    } catch (error) {}
  })
  const avatarsComment = Array.from(new Set(temp))

  const avatars = Array.from(new Set([...avatarsTopic, ...avatarsComment]))
  utils.write(pathCache, avatars)
  return avatars
}

async function downloadAvatar(avatar) {
  const hash = utils.hash(`https:${avatar}`)
  const filePath = `./data/avatar/l/${hash
    .slice(0, 1)
    .toLowerCase()}/${hash}.jpg`
  if (!rewrite && fs.existsSync(filePath)) {
    return true
  }

  const src = `http:${avatar}`.replace('/m/', `/${quality}/`)
  await utils.download(`${src}?r=${utils.getTimestamp()}`, filePath)
  console.log(src, `${avatars.indexOf(avatar)} / ${avatars.length}`)
}
