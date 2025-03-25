Page({
  data: {
    todo: null,
    files: [], // 附件列表
    images: [], // 图片列表
  },

  onLoad(options) {
    const { id, date } = options
    this.loadTodoDetail(id)
  },

  // 加载待办详情
  async loadTodoDetail(id) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTodoDetail',
        data: { id }
      })
      
      this.setData({
        todo: res.result.todo,
        files: res.result.files || [],
        images: res.result.images || []
      })
    } catch (error) {
      console.error('加载待办详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 切换完成状态
  async toggleComplete() {
    try {
      const todo = { ...this.data.todo, completed: !this.data.todo.completed }
      await wx.cloud.callFunction({
        name: 'updateTodo',
        data: {
          id: todo.id,
          completed: todo.completed
        }
      })
      
      this.setData({ todo })
      wx.showToast({
        title: todo.completed ? '已完成' : '已取消完成',
        icon: 'success'
      })
    } catch (error) {
      console.error('更新状态失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 更新内容
  async updateContent(e) {
    const content = e.detail.value
    try {
      await wx.cloud.callFunction({
        name: 'updateTodo',
        data: {
          id: this.data.todo.id,
          content
        }
      })
      
      this.setData({
        todo: { ...this.data.todo, content }
      })
    } catch (error) {
      console.error('更新内容失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 更新描述
  async updateDescription(e) {
    const description = e.detail.value
    try {
      await wx.cloud.callFunction({
        name: 'updateTodo',
        data: {
          id: this.data.todo.id,
          description
        }
      })
      
      this.setData({
        todo: { ...this.data.todo, description }
      })
    } catch (error) {
      console.error('更新描述失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFilePaths.map(path => ({
          path,
          uploading: true
        }))
        
        this.setData({
          images: [...this.data.images, ...tempFiles]
        })
        
        // 上传图片
        tempFiles.forEach((file, index) => {
          this.uploadFile(file.path, 'image', this.data.images.length - tempFiles.length + index)
        })
      }
    })
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => ({
          ...file,
          uploading: true
        }))
        
        this.setData({
          files: [...this.data.files, ...tempFiles]
        })
        
        // 上传文件
        tempFiles.forEach((file, index) => {
          this.uploadFile(file.path, 'file', this.data.files.length - tempFiles.length + index)
        })
      }
    })
  },

  // 上传文件
  async uploadFile(filePath, type, index) {
    try {
      // 上传到云存储
      const cloudPath = `todo/${this.data.todo.id}/${Date.now()}_${Math.random().toString(36).slice(2)}`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })

      // 更新数据库
      await wx.cloud.callFunction({
        name: 'addTodoFile',
        data: {
          todoId: this.data.todo.id,
          fileId: uploadRes.fileID,
          type
        }
      })
      
      if (type === 'image') {
        const images = [...this.data.images]
        images[index] = {
          path: uploadRes.fileID,
          uploading: false
        }
        this.setData({ images })
      } else {
        const files = [...this.data.files]
        files[index] = {
          path: uploadRes.fileID,
          uploading: false
        }
        this.setData({ files })
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const urls = this.data.images.map(img => img.path)
    wx.previewImage({
      current: urls[index],
      urls
    })
  },

  // 删除文件
  async deleteFile(e) {
    const { type, index } = e.currentTarget.dataset
    try {
      const files = type === 'image' ? this.data.images : this.data.files
      const fileId = files[index].path
      
      // 从云存储删除
      await wx.cloud.deleteFile({
        fileList: [fileId]
      })

      // 从数据库删除
      await wx.cloud.callFunction({
        name: 'deleteTodoFile',
        data: {
          todoId: this.data.todo.id,
          fileId,
          type
        }
      })
      
      if (type === 'image') {
        const images = [...this.data.images]
        images.splice(index, 1)
        this.setData({ images })
      } else {
        const files = [...this.data.files]
        files.splice(index, 1)
        this.setData({ files })
      }
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除文件失败:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }
}) 