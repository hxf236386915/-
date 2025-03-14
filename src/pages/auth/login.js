Page({
  data: {
    loading: false
  },

  onLoad() {
    // 页面加载时的处理
  },

  // 处理微信登录
  async handleLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      // 获取用户信息
      const userProfile = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: resolve,
          fail: reject
        })
      })

      // 获取登录code
      const loginResult = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })

      if (!loginResult.code) {
        throw new Error('获取登录凭证失败')
      }

      // 发送登录请求
      const loginRes = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3000/api/users/login',
          method: 'POST',
          data: {
            code: loginResult.code,
            userInfo: userProfile.userInfo
          },
          success: resolve,
          fail: reject
        })
      })

      if (loginRes.statusCode === 200) {
        // 保存token
        wx.setStorageSync('token', loginRes.data.token)
        
        // 保存用户信息
        const app = getApp()
        app.globalData.userInfo = userProfile.userInfo
        app.globalData.token = loginRes.data.token

        // 显示成功提示
        await new Promise(resolve => {
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            success: resolve
          })
        })

        // 延迟跳转
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        throw new Error('登录失败')
      }
    } catch (error) {
      // 统一错误处理
      let message = '登录失败'
      if (error.errMsg && error.errMsg.includes('getUserProfile:fail')) {
        message = '需要您的授权才能继续'
      }
      
      wx.showToast({
        title: message,
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 