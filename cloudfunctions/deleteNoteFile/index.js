const cloud = require('wx-server-sdk')
cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { fileId } = event
  const { OPENID } = cloud.getWXContext()

  if (!fileId) {
    return {
      code: 400,
      message: '参数错误：缺少文件ID'
    }
  }

  try {
    // 检查文件是否存在且属于当前用户
    const file = await db.collection('files')
      .where({
        _id: fileId,
        _openid: OPENID,
        isDeleted: _.neq(true)
      })
      .get()

    if (!file.data || file.data.length === 0) {
      return {
        code: 404,
        message: '文件不存在或已被删除'
      }
    }

    // 从云存储中删除文件
    try {
      await cloud.deleteFile({
        fileList: [file.data[0].fileId]
      })
    } catch (error) {
      console.error('从云存储删除文件失败：', error)
      // 继续执行，因为文件可能已经被删除
    }

    // 标记文件记录为已删除
    await db.collection('files')
      .doc(fileId)
      .update({
        data: {
          isDeleted: true,
          updateTime: db.serverDate()
        }
      })

    return {
      code: 200,
      message: '文件删除成功'
    }

  } catch (error) {
    console.error('删除笔记文件失败：', error)
    return {
      code: 500,
      message: '服务器错误：删除笔记文件失败'
    }
  }
} 