const markdownIt = require('../../utils/markdown-it.min.js')
const md = new markdownIt()

Page({
  data: {
    note: null,
    files: [], // 附件列表
    images: [], // 图片列表
    isPreview: false, // 是否预览模式
    htmlContent: '', // 预览的HTML内容
  },

  onLoad(options) {
    const { id, date } = options
    this.loadNoteDetail(id)
  },

  // 加载笔记详情
  async loadNoteDetail(id) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getNoteDetail',
        data: { id }
      })
      
      this.setData({
        note: res.result.note,
        files: res.result.files || [],
        images: res.result.images || []
      })
      this.updatePreview()
    } catch (error) {
      console.error('加载笔记详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 更新标题
  async updateTitle(e) {
    const title = e.detail.value
    try {
      await wx.cloud.callFunction({
        name: 'updateNote',
        data: {
          id: this.data.note.id,
          title
        }
      })
      
      this.setData({
        note: { ...this.data.note, title }
      })
    } catch (error) {
      console.error('更新标题失败:', error)
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
        name: 'updateNote',
        data: {
          id: this.data.note.id,
          content
        }
      })
      
      this.setData({
        note: { ...this.data.note, content }
      })
      this.updatePreview()
    } catch (error) {
      console.error('更新内容失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 更新预览内容
  updatePreview() {
    if (!this.data.note?.content) return
    
    // 使用 markdown-it 解析 Markdown
    const html = md.render(this.data.note.content)
    this.setData({ htmlContent: html })
  },

  // 切换预览模式
  togglePreview() {
    this.setData({ isPreview: !this.data.isPreview })
    if (this.data.isPreview) {
      this.updatePreview()
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
      const cloudPath = `note/${this.data.note.id}/${Date.now()}_${Math.random().toString(36).slice(2)}`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })

      // 更新数据库
      await wx.cloud.callFunction({
        name: 'addNoteFile',
        data: {
          noteId: this.data.note.id,
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
        
        // 在光标位置插入图片Markdown语法
        const content = this.data.note.content + `\n![图片](${uploadRes.fileID})\n`
        this.setData({
          note: { ...this.data.note, content }
        })
        this.updatePreview()
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
        name: 'deleteNoteFile',
        data: {
          noteId: this.data.note.id,
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
  },

  // 插入Markdown语法
  insertMarkdown(type) {
    let insert = ''
    const content = this.data.note.content || ''
    const cursor = content.length // TODO: 获取真实光标位置
    
    switch (type) {
      case 'bold':
        insert = '**粗体文本**'
        break
      case 'italic':
        insert = '*斜体文本*'
        break
      case 'link':
        insert = '[链接文本](https://example.com)'
        break
      case 'list':
        insert = '\n- 列表项1\n- 列表项2\n'
        break
      case 'task':
        insert = '\n- [ ] 待办任务\n- [x] 已完成任务\n'
        break
      case 'code':
        insert = '\n```\n代码块\n```\n'
        break
    }
    
    const newContent = content.slice(0, cursor) + insert + content.slice(cursor)
    this.setData({
      note: { ...this.data.note, content: newContent }
    })
    this.updatePreview()
    
    // 更新到后端
    wx.cloud.callFunction({
      name: 'updateNote',
      data: {
        id: this.data.note.id,
        content: newContent
      }
    }).catch(error => {
      console.error('更新内容失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    })
  }
}) 