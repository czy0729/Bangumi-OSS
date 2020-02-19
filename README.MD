## Bangumi 对象储存

[![](https://data.jsdelivr.com/v1/package/gh/czy0729/Bangumi-OSS/badge)](https://www.jsdelivr.com/package/gh/czy0729/Bangumi-OSS)

服务于 [Bangumi-App](https://github.com/czy0729/Bangumi).

因服务器在国外, App 里请求官方图片依然会较慢, 对热门的封面图和用户头像进行爬取, 增加获取源头, 比官方更稳定.

通过 jsdelivr 达到白嫖效果.

### 使用方法

#### 条目图片暂只爬取了 /c/ 的质量

utils.js

```
const HOST_CDN = 'https://cdn.jsdelivr.net'
const I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split(
  ''
)
function hash(input) {
  let hash = 5381
  let i = input.length - 1

  if (typeof input == 'string') {
    for (; i > -1; i -= 1) hash += (hash << 5) + input.charCodeAt(i)
  } else {
    for (; i > -1; i -= 1) hash += (hash << 5) + input[i]
  }
  let value = hash & 0x7fffffff

  let retValue = ''
  do {
    retValue += I64BIT_TABLE[value & 0x3f]
  } while ((value >>= 6))

  return retValue
}
```

CDN_OSS_SUBJECT.js

```
const HASH_SUBJECT = {
  AMC5E: ''
}

/**
 * 条目封面CDN
 * @url https://github.com/czy0729/Bangumi-OSS
 */
const subjectCache = {}
const CDN_OSS_SUBJECT = src => {
  if (typeof src !== 'string') {
    return src
  }

  if (subjectCache[src]) {
    return subjectCache[src]
  }

  // 修正图片地址
  let _src = src.split('?')[0]
  if (_src.indexOf('https:') === -1 && _src.indexOf('http:') === -1) {
    _src = `https:${_src}`
  }
  _src = _src.replace('http://', 'https://')

  /**
   * 计算图片hash, 之后查询在不在OSS缓存里面
   * 计算规则: 带https://开头, 使用/c/质量, 去掉?后面的参数
   */
  const _hash = hash(_src)
  if (_hash in HASH_SUBJECT) {
    const path = _hash.slice(0, 1).toLocaleLowerCase()
    const cdnSrc = `${HOST_CDN}/gh/czy0729/Bangumi-OSS@master/data/subject/c/${path}/${_hash}.jpg`
    subjectCache[src] = cdnSrc
    return cdnSrc
  }

  subjectCache[src] = src
  return src
}
```

计算 https://lain.bgm.tv/pic/cover/c/73/90/285776_57c5p.jpg 获取地址

```
CDN_OSS_SUBJECT('https://lain.bgm.tv/pic/cover/c/73/90/285776_57c5p.jpg')

// => https://cdn.jsdelivr.net/gh/czy0729/Bangumi-OSS@master/data/subject/c/a/AMC5E.jpg
```

#### 用户头像暂只爬取了 /m/ 的质量

CDN_OSS_AVATAR.js

```
const HASH_AVATAR = {
  AMC5E: ''
}

/**
 * 头像CDN
 * @url https://github.com/czy0729/Bangumi-OSS
 */
const avatarCache = {}
const CDN_OSS_AVATAR = src => {
  if (typeof src !== 'string') {
    return src
  }

  if (avatarCache[src]) {
    return avatarCache[src]
  }

  // 修正图片地址
  let _src = src.split('?')[0]
  if (_src.indexOf('https:') === -1 && _src.indexOf('http:') === -1) {
    _src = `https:${_src}`
  }
  _src = _src.replace('http://', 'https://')

  /**
   * 计算图片hash, 之后查询在不在OSS缓存里面
   * 计算规则: 带https://开头, 使用/m/质量, 去掉?后面的参数
   */
  const _hash = hash(_src)
  if (_hash in HASH_AVATAR) {
    const path = _hash.slice(0, 1).toLocaleLowerCase()
    const cdnSrc = `${HOST_CDN}/gh/czy0729/Bangumi-OSS@master/data/avatar/m/${path}/${_hash}.jpg`
    avatarCache[src] = cdnSrc
    return cdnSrc
  }

  avatarCache[src] = src
  return src
}
```

计算 https://lain.bgm.tv/pic/user/m/000/45/62/456208.jpg 获取地址

```
CDN_OSS_AVATAR('https://lain.bgm.tv/pic/user/m/000/45/62/456208.jpg')

// => https://cdn.jsdelivr.net/gh/czy0729/Bangumi-OSS@master/data/avatar/m/q/qbfGEB.jpg
```

### 关于 HASH

变量 `HASH_SUBJECT` 和 `HASH_AVATAR` 为已存在的所有图片的计算后 hash 作为 key 的对象, 有 key 图片才存在, 存放在 `./hash/` 目录下
