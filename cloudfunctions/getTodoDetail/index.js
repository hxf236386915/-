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
    // 获取待办详情
    const todo = await db.collection('todos')
      .doc(id)
      .get()

    if (!todo.data || todo.data._openid !== openid) {
      throw new Error('待办事项不存在或无权限')
    }

    // 获取关联的文件
    const filesRes = await db.collection('todo_files')
      .where({
        todoId: id,
        _openid: openid,
        deleted: _.neq(true)
      })
      .get()

    // 处理文件数据
    const files = filesRes.data.map(file => ({
      id: file._id,
      path: file.fileID,
      name: file.name,
      type: file.type,
      createTime: file.createTime
    }))

    // 分类文件
    const images = files.filter(file => file.type === 'image')
    const attachments = files.filter(file => file.type === 'file')

    return {
      success: true,
      result: {
        todo: {
          id: todo.data._id,
          content: todo.data.content,
          description: todo.data.description || '',
          completed: todo.data.completed || false,
          date: todo.data.date,
          createTime: todo.data.createTime,
          updateTime: todo.data.updateTime
        },
        files: attachments,
        images: images
      }
    }
  } catch (error) {
    console.error('获取待办详情失败:', error)
    return {
      success: false,
      error: error
    }
  }
} 