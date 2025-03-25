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
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'xiaolvxiaogongju-9fryvqi78a6816d',
        traceUser: true // 是否要捕捉每个用户的访问记录
      })
    }

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