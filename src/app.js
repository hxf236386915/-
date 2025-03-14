// 后端接口基础地址
const API_BASE_URL = 'https://api.example.com' // TODO: 替换为实际的后端API地址

App({
  globalData: {
    userInfo: null,
    token: null,
    config: {
      flomo: {
        enabled: false,
        apiKey: ''
      },
      notion: {
        enabled: false,
        apiKey: ''
      }
    }
  },

  onLaunch() {
    console.log('App onLaunch')
    // 检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const config = wx.getStorageSync('config')

    console.log('检查登录状态:', { 
      hasToken: !!token, 
      hasUserInfo: !!userInfo,
      hasConfig: !!config
    })

    // 恢复全局数据
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    if (token) {
      this.globalData.token = token
    }
    if (config) {
      this.globalData.config = config
    }

    // 如果没有token，跳转到登录页
    if (!token) {
      console.log('未找到token，跳转到登录页')
      this.redirectToLogin()
      return
    }

    // 如果有token，验证token有效性
    this.checkToken(token)
  },

  async checkToken(token) {
    console.log('开始验证token')
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/api/auth/check-token`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            console.log('token验证响应:', res)
            resolve(res)
          },
          fail: (error) => {
            console.error('token验证请求失败:', error)
            reject(error)
          }
        })
      })

      console.log('token验证结果:', res.statusCode, res.data)

      if (res.statusCode === 200 && res.data && res.data.valid) {
        // token有效，更新用户信息
        console.log('token有效，更新用户信息')
        this.globalData.userInfo = res.data.userInfo
        wx.setStorageSync('userInfo', res.data.userInfo)
        
        // 更新配置
        if (res.data.config) {
          this.globalData.config = res.data.config
          wx.setStorageSync('config', res.data.config)
        }
      } else {
        // token无效，清除信息并跳转到登录页
        console.log('token无效，清除信息')
        this.clearLoginInfo()
      }
    } catch (error) {
      console.error('验证token失败:', error)
      // 请求失败，清除信息并跳转到登录页
      this.clearLoginInfo()
    }
  },

  clearLoginInfo() {
    console.log('清除登录信息')
    // 清除本地存储
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('config')
    
    // 清除全局数据
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.config = {
      flomo: { enabled: false, apiKey: '' },
      notion: { enabled: false, apiKey: '' }
    }

    this.redirectToLogin()
  },

  redirectToLogin() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    // 如果当前不在登录页，才跳转
    if (!currentPage || currentPage.route !== 'pages/login/login') {
      console.log('跳转到登录页')
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  }
}) 