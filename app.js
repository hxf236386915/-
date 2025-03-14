App({
  globalData: {
    userInfo: null,
    token: null,
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

  onLaunch() {
    // 获取本地存储的用户信息和配置
    const userInfo = wx.getStorageSync('userInfo')
    const token = wx.getStorageSync('token')
    const config = wx.getStorageSync('config')

    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    if (token) {
      this.globalData.token = token
    }
    if (config) {
      this.globalData.config = config
    }

    // 检查登录状态
    this.checkLogin()
  },

  checkLogin() {
    if (!this.globalData.token) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  }
}) 