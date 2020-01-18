/*
 * @Author: czy0729
 * @Date: 2020-01-14 19:30:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-17 16:01:23
 */
const utils = require('./utils')
const match = require('./match')
const decoder = require('./decoder')

const HOST = 'https://bgm.tv'
const INIT_TOPIC = {
  avatar: '', // 作者头像
  floor: '', // 楼层
  // formhash: '', // 回复表单凭据
  group: '', // 小组名称
  groupHref: '', // 小组地址
  groupThumb: '', // 小组图片
  // lastview: '', // 回复表单时间戳
  message: '', // 帖子内容
  time: '', // 发帖时间
  title: '', // 帖子标题
  userId: '', // 作者Id
  userName: '', // 作者名称
  userSign: '' // 作者签名
}
const INIT_COMMENTS_ITEM = {
  avatar: '', // 用户头像
  floor: '', // 楼层
  id: '', // 楼层id
  // replySub: '', // 回复参数
  time: '', // 发帖时间
  userId: '', // 用户Id
  userName: '', // 用户名称
  userSign: '' // 用户签名
  // erase: '' // 删除的链接
}

function cheerioMono(HTML) {
  let topic = INIT_TOPIC
  let comments = []

  try {
    const $ = utils.cheerio(HTML)

    // 主楼
    const $group = $('#pageHeader a.avatar')
    const $user = $('div.postTopic strong > a.l')
    const [floor, time] = ($('div.postTopic div.re_info > small').text() || '')
      .split('/')[0]
      .split(' - ')
    const titleText = $('#pageHeader > h1').text() || ''
    let title
    if (titleText.includes(' » ')) {
      title = String(titleText.split(' » ')[1]).replace(/讨论|章节/, '')
    } else {
      title = String(titleText.split(' / ')[1])
    }
    topic = utils.safeObject({
      avatar: utils.getCoverSmall(
        match.matchAvatar($('div.postTopic span.avatarNeue').attr('style'))
      ),
      floor,
      // formhash: $('input[name=formhash]').attr('value'),
      group: String($group.text()).replace(/\n/g, ''),
      groupHref: $group.attr('href'),
      groupThumb: utils.getCoverSmall($('a.avatar > img.avatar').attr('src')),
      // lastview: '',
      message: decoder.decoder(utils.HTMLTrim($('div.topic_content').html())),
      time,
      title,
      userId: match.matchUserId($user.attr('href')),
      userName: $user.text(),
      userSign: $('div.postTopic span.tip_j').text()
    })

    // 回复
    comments =
      $('#comment_list > div.row_reply')
        .map((index, element) => {
          const $row = utils.cheerio(element)

          const [floor, time] = (
            $row.find('> div.re_info > small').text() || ''
          )
            .split('/')[0] // 这里其实为了去除 / del / edit
            .split(' - ')
          return utils.safeObject({
            ...INIT_COMMENTS_ITEM,
            avatar: utils.getCoverSmall(
              match.matchAvatar($row.find('span.avatarNeue').attr('style'))
            ),
            floor,
            id: $row.attr('id').substring(5),
            message: decoder.decoder(
              utils.HTMLTrim(
                $row
                  .find('> div.inner > div.reply_content > div.message')
                  .html()
              )
            ),
            // replySub: $row
            //   .find('> div.inner > span.userInfo > a.icons_cmt')
            //   .attr('onclick'),
            time,
            userId: match.matchUserId($row.find('a.avatar').attr('href')),
            userName:
              $row.find('> div.inner > span.userInfo > strong > a.l').text() ||
              $row.find('> div.inner > strong > a.l').text(),
            userSign: $row.find('span.tip_j').text(),
            // erase: $row.find('> div.re_info a.erase_post').attr('href'),

            // 子回复
            sub:
              $row
                .find('div.sub_reply_bg')
                .map((index, element) => {
                  const $row = utils.cheerio(element, {
                    decodeEntities: false
                  })
                  const [floor, time] = ($row.find('small').text() || '')
                    .split('/')[0] // 这里其实为了去除 / del / edit
                    .split(' - ')
                  return utils.safeObject({
                    ...INIT_COMMENTS_ITEM,
                    avatar: utils.getCoverSmall(
                      match.matchAvatar(
                        $row.find('span.avatarNeue').attr('style')
                      )
                    ),
                    floor,
                    id: $row.attr('id').substring(5),
                    message: decoder.decoder(
                      utils.HTMLTrim($row.find('div.cmt_sub_content').html())
                    ),
                    // replySub: $row.find('a.icons_cmt').attr('onclick'),
                    time: utils.trim(time),
                    userId: match.matchUserId(
                      $row.find('a.avatar').attr('href')
                    ),
                    userName: $row.find('strong > a.l').text(),
                    userSign: $row.find('span.tip_j').text()
                    // erase: $row.find('a.erase_post').attr('href')
                  })
                })
                .get() || []
          })
        })
        .get() || []
  } catch (ex) {
    // do nothing
  }

  return {
    topic,
    comments
  }
}

module.exports = {
  cheerioMono
}
