const app = getApp()

// 后端接口基础地址
const API_BASE_URL = wx.getSystemInfoSync().platform === 'devtools' 
  ? 'http://127.0.0.1:3000'  // 开发者工具中使用 127.0.0.1
  : 'http://localhost:3000'   // 真机预览时使用实际的服务器地址

Page({
  data: {
    loading: false
  },

  onLoad() {
    console.log('当前运行环境:', wx.getSystemInfoSync().platform)
    // 检查是否已经登录
    const token = wx.getStorageSync('token')
    if (token) {
      this.redirectToIndex()
    }
  },

  // 处理获取用户信息
  async handleGetUserInfo(e) {
    console.log('用户信息回调:', e)
    
    if (this.data.loading) return
    
    // 如果用户拒绝授权
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '需要您的授权才能继续',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 1. 获取登录code
      const loginResult = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })

      if (!loginResult.code) {
        throw new Error('获取登录凭证失败')
      }

      console.log('准备发送登录请求到:', `${API_BASE_URL}/api/users/login`)

      // 2. 发送登录请求
      const loginRes = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/api/users/login`,
          method: 'POST',
          data: {
            code: loginResult.code,
            userInfo: e.detail.userInfo
          },
          success: (res) => {
            console.log('登录响应:', res)
            resolve(res)
          },
          fail: (error) => {
            console.error('登录请求失败:', error)
            // 添加更多错误信息
            if (error.errMsg.includes('fail -102')) {
              console.error('无法连接到服务器，请确保后端服务已启动')
            }
            reject(error)
          }
        })
      })

      console.log('登录返回数据:', loginRes.data)

      if (loginRes.statusCode === 200 && loginRes.data.token) {
        // 保存token和用户信息
        wx.setStorageSync('token', loginRes.data.token)
        wx.setStorageSync('userInfo', loginRes.data.userInfo || e.detail.userInfo)
        
        // 更新全局数据
        app.globalData.token = loginRes.data.token
        app.globalData.userInfo = loginRes.data.userInfo || e.detail.userInfo
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
        if (error.errMsg.includes('fail -102')) {
          message = '无法连接到服务器，请确保后端服务已启动'
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