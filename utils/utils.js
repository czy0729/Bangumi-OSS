/*
 * @Author: czy0729
 * @Date: 2020-01-14 19:30:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-07 22:47:05
 */
const path = require('path')
const fs = require('fs')
const cheerioRN = require('cheerio-without-node-native')
const axios = require('axios')

function safeObject(object = {}) {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined) {
      // eslint-disable-next-line no-param-reassign
      object[key] = ''
    }
  })
  return object
}

function getCoverSmall(src = '') {
  if (typeof src !== 'string' || src === '') {
    return ''
  }
  return src.replace(/\/g\/|\/s\/|\/c\/|\/l\//, '/m/')
}

function getCoverMedium(src = '', mini = false) {
  if (typeof src !== 'string' || src === '') {
    return ''
  }

  // 角色图片不要处理
  if (src.includes('/crt/')) {
    return src
  }

  // 用户头像和小组图标没有/c/类型
  if (mini || src.includes('/user/') || src.includes('/icon/')) {
    return src.replace(/\/g\/|\/s\/|\/c\/|\/l\//, '/m/')
  }
  return src.replace(/\/g\/|\/s\/|\/m\/|\/l\//, '/c/')
}

function removeCF(HTML = '') {
  return HTML.replace(
    /<script[^>]*>([\s\S](?!<script))*?<\/script>|<noscript[^>]*>([\s\S](?!<script))*?<\/noscript>|style="display:none;visibility:hidden;"/g,
    ''
  ).replace(/data-cfsrc/g, 'src')
}

function cheerio(target) {
  if (typeof target === 'string') {
    return cheerioRN.load(removeCF(target))
  }
  return cheerioRN(target)
}

async function queue(fetchs, num = 2) {
  if (!fetchs.length) {
    return false
  }

  await Promise.all(
    new Array(num).fill(0).map(async () => {
      while (fetchs.length) {
        // eslint-disable-next-line no-await-in-loop
        await fetchs.shift()()
      }
    })
  )
  return true
}

function safeStringify(data) {
  return JSON.stringify(data).replace(/:null/g, ':""')
}

function getTimestamp() {
  return Math.floor(new Date().valueOf() / 1000)
}

function smallImage(item, type = 'medium') {
  return ((item.images && item.images[type]) || '')
    .replace('http://lain.bgm.tv/', '//lain.bgm.tv/')
    .replace('https://lain.bgm.tv/', '//lain.bgm.tv/')
    .split('?')[0]
}

function HTMLTrim(str = '') {
  if (typeof str !== 'string') {
    return str
  }
  return (
    removeCF(str)
      // .replace(/<!--.*?-->/gi, '')
      // .replace(/\/\*.*?\*\//gi, '')
      // .replace(/[ ]+</gi, '<')
      .replace(/\n+|\s\s\s*|\t/g, '')
      .replace(/"class="/g, '" class="')

      // 补充 190829
      .replace(/> </g, '><')
  )
}

function trim(str = '') {
  return str.replace(/^\s+|\s+$/gm, '')
}

const I64BIT_TABLE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('')
function hash(input) {
  let hash = 5381
  let i = input.length - 1

  if (typeof input == 'string') {
    for (; i > -1; i--) hash += (hash << 5) + input.charCodeAt(i)
  } else {
    for (; i > -1; i--) hash += (hash << 5) + input[i]
  }
  let value = hash & 0x7fffffff

  let retValue = ''
  do {
    retValue += I64BIT_TABLE[value & 0x3f]
  } while ((value >>= 6))

  return retValue
}

function sleep(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 读
 * @param {*} path
 */
function read(path) {
  return JSON.parse(fs.readFileSync(path))
}

/**
 * 写
 * @param {*} path
 * @param {*} data
 * @param {*} min
 */
function write(path, data, min = false) {
  return fs.writeFileSync(
    path,
    min ? JSON.stringify(data) : JSON.stringify(data, null, 2)
  )
}

async function download(url, pathData) {
  return new Promise(async (resolve, reject) => {
    try {
      const dirPath = path.dirname(pathData)
      if (!fs.existsSync(dirPath)) {
        const rootPath = path.join(dirPath, '..')
        if (!fs.existsSync(rootPath)) {
          fs.mkdirSync(rootPath)
        }
        fs.mkdirSync(dirPath)
      }

      const writer = fs.createWriteStream(pathData)
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      })

      response.data.pipe(writer)
      writer.on('finish', () => {
        resolve()
      })
    } catch (error) {
      console.log('catch')
      resolve()
    }
  })
}

module.exports = {
  safeObject,
  getCoverSmall,
  getCoverMedium,
  removeCF,
  cheerio,
  queue,
  safeStringify,
  getTimestamp,
  smallImage,
  HTMLTrim,
  trim,
  hash,
  sleep,
  read,
  write,
  download,
}
