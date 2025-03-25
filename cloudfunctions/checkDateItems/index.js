// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { date } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询待办事项
    const todosCount = await db.collection('todos')
      .where({
        _openid: openid,
        date: date,
        deleted: _.neq(true)
      })
      .count()

    // 查询笔记
    const notesCount = await db.collection('notes')
      .where({
        _openid: openid,
        date: date,
        deleted: _.neq(true)
      })
      .count()

    return {
      success: true,
      result: {
        hasTodos: todosCount.total > 0,
        hasNotes: notesCount.total > 0
      }
    }
  } catch (error) {
    console.error('检查日期内容失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 