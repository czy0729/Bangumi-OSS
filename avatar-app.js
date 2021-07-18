/*
 * @Author: czy0729
 * @Date: 2021-07-18 13:32:38
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-07-18 13:43:46
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')

const start = 3600

function getAvatars() {
  const filePaths = []
  function findJsonFile(path) {
    fs.readdirSync(path).forEach((item, index) => {
      const fPath = join(path, item)
      const stat = fs.statSync(fPath)
      if (stat.isDirectory() === true) {
        findJsonFile(fPath)
      }
      if (stat.isFile() === true && !fPath.includes('.DS_Store')) {
        // 只使用最近半年的帖子
        const t = fPath.split(
          fPath.includes('/topic/') ? '/topic/' : '/comment/'
        )
        const folder = parseInt(t[1].split('/')[0])
        if (folder >= start) filePaths.push(fPath)
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
  return avatars
}

const hashMap = {}
getAvatars().forEach((image) => {
  const hash = utils.hash(`https:${image}`)
  hashMap[hash] = ''
})

const filePath = './hash/avatar.min.json'
fs.writeFileSync(filePath, JSON.stringify(hashMap))
