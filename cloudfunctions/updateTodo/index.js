// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { id, content, description, date } = event
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

    // 构建更新数据
    const updateData = {
      updateTime: db.serverDate()
    }
    
    if (content !== undefined) {
      updateData.content = content
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (date !== undefined) {
      updateData.date = date
    }

    // 更新待办事项
    const result = await db.collection('todos')
      .doc(id)
      .update({
        data: updateData
      })

    return {
      success: true,
      result: {
        updated: result.stats.updated > 0,
        updateTime: new Date()
      }
    }
  } catch (error) {
    console.error('更新待办事项失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 