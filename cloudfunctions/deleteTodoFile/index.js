// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { todoId, fileId } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 获取文件记录
    const file = await db.collection('todo_files')
      .doc(fileId)
      .get()

    if (!file.data || file.data._openid !== openid) {
      throw new Error('文件不存在或无权限')
    }

    // 检查待办事项权限
    const todo = await db.collection('todos')
      .doc(todoId)
      .get()

    if (!todo.data || todo.data._openid !== openid) {
      throw new Error('待办事项不存在或无权限')
    }

    // 删除云存储中的文件
    await cloud.deleteFile({
      fileList: [file.data.fileID]
    })

    // 标记文件记录为已删除
    const result = await db.collection('todo_files')
      .doc(fileId)
      .update({
        data: {
          deleted: true,
          deleteTime: db.serverDate()
        }
      })

    return {
      success: true,
      result: {
        deleted: result.stats.updated > 0
      }
    }
  } catch (error) {
    console.error('删除待办文件失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 