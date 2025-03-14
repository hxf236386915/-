const app = getApp()

Page({
  data: {
    userInfo: null,
    config: {
      flomo: {
        apiKey: '',
        enabled: false
      },
      notion: {
        apiKey: '',
        enabled: false
      }
    }
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo,
      config: app.globalData.config
    })
  },

  // 切换服务开关
  async toggleService(e) {
    const { service } = e.currentTarget.dataset
    const config = { ...this.data.config }
    config[service].enabled = !config[service].enabled

    try {
      // 保存配置
      wx.setStorageSync('config', config)
      app.globalData.config = config
      
      this.setData({ config })

      wx.showToast({
        title: config[service].enabled ? '已启用' : '已禁用',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 设置API Key
  async setApiKey(e) {
    const { service } = e.currentTarget.dataset
    const { value } = e.detail

    const config = { ...this.data.config }
    config[service].apiKey = value

    try {
      // 保存配置
      wx.setStorageSync('config', config)
      app.globalData.config = config
      
      this.setData({ config })
    } catch (error) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('token')
          
          // 清除全局数据
          const app = getApp()
          app.globalData.userInfo = null
          app.globalData.token = null
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/auth/login'
          })
        }
      }
    })
  }
}) 