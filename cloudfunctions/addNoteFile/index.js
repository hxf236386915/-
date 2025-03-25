const cloud = require('wx-server-sdk')
cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { noteId, fileId, fileName, fileType } = event
  const { OPENID } = cloud.getWXContext()

  if (!noteId || !fileId || !fileName || !fileType) {
    return {
      code: 400,
      message: '参数错误：缺少必要参数'
    }
  }

  try {
    // 检查笔记是否存在且属于当前用户
    const note = await db.collection('notes')
      .where({
        _id: noteId,
        _openid: OPENID,
        isDeleted: _.neq(true)
      })
      .get()

    if (!note.data || note.data.length === 0) {
      return {
        code: 404,
        message: '笔记不存在或已被删除'
      }
    }

    // 添加文件记录
    const fileResult = await db.collection('files').add({
      data: {
        noteId,
        fileId,
        fileName,
        fileType,
        _openid: OPENID,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    return {
      code: 200,
      data: {
        _id: fileResult._id
      },
      message: '文件添加成功'
    }

  } catch (error) {
    console.error('添加笔记文件失败：', error)
    return {
      code: 500,
      message: '服务器错误：添加笔记文件失败'
    }
  }
} 