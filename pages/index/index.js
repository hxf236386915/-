const app = getApp()

Page({
  data: {
    userInfo: {},
    todoCount: 0,
    recentNotes: []
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      // 获取待办数量（模拟数据）
      this.setData({
        todoCount: 5
      })

      // 获取最近笔记（模拟数据）
      this.setData({
        recentNotes: [
          {
            id: 1,
            title: '测试笔记1',
            content: '这是一条测试笔记内容...',
            createTime: '2024-03-20'
          },
          {
            id: 2,
            title: '测试笔记2',
            content: '这是另一条测试笔记内容...',
            createTime: '2024-03-19'
          }
        ]
      })
    } catch (error) {
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      })
    }
  },

  // 跳转到待办列表
  goToTodo() {
    wx.switchTab({
      url: '/pages/todo/todo'
    })
  },

  // 查看笔记详情
  viewNoteDetail(e) {
    const { id } = e.currentTarget.dataset
    // 这里应该跳转到笔记详情页
    console.log('查看笔记:', id)
  }
}) 