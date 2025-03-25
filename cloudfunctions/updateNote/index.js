const cloud = require('wx-server-sdk')
cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { noteId, title, content, date } = event
  const { OPENID } = cloud.getWXContext()

  if (!noteId) {
    return {
      code: 400,
      message: '参数错误：缺少笔记ID'
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

    // 构建更新对象
    const updateData = {
      updateTime: db.serverDate()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (date !== undefined) updateData.date = date

    // 更新笔记
    await db.collection('notes')
      .doc(noteId)
      .update({
        data: updateData
      })

    return {
      code: 200,
      message: '笔记更新成功'
    }

  } catch (error) {
    console.error('更新笔记失败：', error)
    return {
      code: 500,
      message: '服务器错误：更新笔记失败'
    }
  }
} 