// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'xiaolvxiaogongju-9fryvqi78a6816d'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { todoId, fileID, type, name } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 检查待办事项权限
    const todo = await db.collection('todos')
      .doc(todoId)
      .get()

    if (!todo.data || todo.data._openid !== openid) {
      throw new Error('待办事项不存在或无权限')
    }

    // 添加文件记录
    const result = await db.collection('todo_files').add({
      data: {
        _openid: openid,
        todoId,
        fileID,
        type,
        name: name || '',
        createTime: db.serverDate(),
        deleted: false
      }
    })

    return {
      success: true,
      result: {
        id: result._id,
        fileID
      }
    }
  } catch (error) {
    console.error('添加待办文件失败:', error)
    // 如果添加失败，删除已上传的文件
    if (fileID) {
      try {
        await cloud.deleteFile({
          fileList: [fileID]
        })
      } catch (e) {
        console.error('删除文件失败:', e)
      }
    }
    return {
      success: false,
      error: error
    }
  }
} 