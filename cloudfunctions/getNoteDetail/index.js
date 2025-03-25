// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { noteId } = event
  const { OPENID } = cloud.getWXContext()

  if (!noteId) {
    return {
      code: 400,
      message: '参数错误：缺少笔记ID'
    }
  }

  try {
    // 获取笔记详情
    const noteResult = await db.collection('notes')
      .aggregate()
      .match({
        _id: noteId,
        _openid: OPENID,
        isDeleted: _.neq(true)
      })
      .lookup({
        from: 'files',
        let: { noteId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$noteId', '$$noteId'] },
                  { $ne: ['$isDeleted', true] }
                ]
              }
            }
          }
        ],
        as: 'files'
      })
      .end()

    if (!noteResult.list || noteResult.list.length === 0) {
      return {
        code: 404,
        message: '笔记不存在或已被删除'
      }
    }

    const note = noteResult.list[0]

    // 分类文件
    note.images = note.files.filter(file => file.type.startsWith('image/'))
    note.attachments = note.files.filter(file => !file.type.startsWith('image/'))

    return {
      code: 200,
      data: note
    }

  } catch (error) {
    console.error('获取笔记详情失败：', error)
    return {
      code: 500,
      message: '服务器错误：获取笔记详情失败'
    }
  }
} 