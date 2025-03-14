const app = getApp()

Page({
  data: {
    userInfo: null,
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

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo,
      config: app.globalData.config
    })
  },

  // 切换 Flomo 开关
  handleFlomoSwitch(e) {
    const config = { ...this.data.config }
    config.flomo.enabled = e.detail.value
    this.updateConfig(config)
  },

  // 处理 Flomo API Key 输入
  handleFlomoInput(e) {
    const config = { ...this.data.config }
    config.flomo.apiKey = e.detail.value
    this.updateConfig(config)
  },

  // 切换 Notion 开关
  handleNotionSwitch(e) {
    const config = { ...this.data.config }
    config.notion.enabled = e.detail.value
    this.updateConfig(config)
  },

  // 处理 Notion API Key 输入
  handleNotionInput(e) {
    const config = { ...this.data.config }
    config.notion.apiKey = e.detail.value
    this.updateConfig(config)
  },

  // 更新配置
  async updateConfig(config) {
    try {
      const token = wx.getStorageSync('token')
      const res = await wx.request({
        url: 'http://localhost:3000/api/users/config',
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: { config }
      })

      if (res.statusCode === 200) {
        // 更新全局配置
        app.globalData.config = config
        // 更新本地存储
        wx.setStorageSync('config', config)
        // 更新页面数据
        this.setData({ config })

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        throw new Error('更新配置失败')
      }
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
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('config')
          
          // 清除全局数据
          app.globalData.userInfo = null
          app.globalData.token = null
          app.globalData.config = {
            flomo: { enabled: false, apiKey: '' },
            notion: { enabled: false, apiKey: '' }
          }
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
}) 