const app = getApp()

// 后端接口基础地址
const API_BASE_URL = 'https://api.example.com' // TODO: 替换为实际的后端API地址

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token')
    if (token) {
      this.redirectToIndex()
    }
  },

  // 处理微信登录
  async handleLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      // 1. 先获取登录code
      const loginResult = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })

      if (!loginResult.code) {
        throw new Error('获取登录凭证失败')
      }

      // 2. 获取用户信息
      const userProfile = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: resolve,
          fail: reject
        })
      })

      // 3. 发送登录请求
      const loginRes = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/api/auth/wx-login`,
          method: 'POST',
          data: {
            code: loginResult.code,
            rawData: userProfile.rawData,
            signature: userProfile.signature,
            encryptedData: userProfile.encryptedData,
            iv: userProfile.iv
          },
          success: (res) => {
            console.log('登录响应:', res)
            resolve(res)
          },
          fail: (error) => {
            console.error('登录请求失败:', error)
            reject(error)
          }
        })
      })

      console.log('登录返回数据:', loginRes.data)

      if (loginRes.statusCode === 200 && loginRes.data.token) {
        // 保存token和用户信息
        wx.setStorageSync('token', loginRes.data.token)
        wx.setStorageSync('userInfo', loginRes.data.userInfo)
        
        // 更新全局数据
        app.globalData.token = loginRes.data.token
        app.globalData.userInfo = loginRes.data.userInfo
        app.globalData.config = loginRes.data.config || {
          flomo: { enabled: false, apiKey: '' },
          notion: { enabled: false, apiKey: '' }
        }

        // 保存配置
        wx.setStorageSync('config', app.globalData.config)

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
        console.error('登录响应异常:', loginRes)
        throw new Error(loginRes.data.message || '登录失败，请稍后重试')
      }
    } catch (error) {
      console.error('登录错误:', error)
      // 统一错误处理
      let message = '登录失败'
      if (error.errMsg) {
        if (error.errMsg.includes('getUserProfile:fail')) {
          message = '需要您的授权才能继续'
        } else {
          message = error.errMsg
        }
      }
      
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到首页
  redirectToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
}) 