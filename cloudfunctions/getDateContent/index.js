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
    // 获取待办事项
    const todosRes = await db.collection('todos')
      .where({
        _openid: openid,
        date: date,
        deleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .get()

    // 获取笔记
    const notesRes = await db.collection('notes')
      .where({
        _openid: openid,
        date: date,
        deleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .get()

    // 处理待办事项数据
    const todos = todosRes.data.map(todo => ({
      id: todo._id,
      content: todo.content,
      completed: todo.completed || false,
      description: todo.description || '',
      createTime: todo.createTime
    }))

    // 处理笔记数据
    const notes = notesRes.data.map(note => ({
      id: note._id,
      title: note.title || '',
      content: note.content || '',
      createTime: note.createTime
    }))

    return {
      success: true,
      result: {
        todos,
        notes
      }
    }
  } catch (error) {
    console.error('获取日期内容失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 