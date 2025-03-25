// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 获取当前待办事项
    const todo = await db.collection('todos')
      .doc(id)
      .get()

    if (!todo.data || todo.data._openid !== openid) {
      throw new Error('待办事项不存在或无权限')
    }

    // 更新完成状态
    const result = await db.collection('todos')
      .doc(id)
      .update({
        data: {
          completed: !todo.data.completed,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true,
      result: {
        updated: result.stats.updated > 0,
        completed: !todo.data.completed
      }
    }
  } catch (error) {
    console.error('切换待办状态失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 