const app = getApp()

// 基础配置
const config = {
  baseURL: 'https://api.example.com', // 替换为实际的API地址
  timeout: 10000
}

// 请求拦截器
function requestInterceptor(options) {
  const token = app.globalData.token
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  return options
}

// 响应拦截器
function responseInterceptor(response) {
  if (response.statusCode === 401) {
    // token过期，跳转到登录页
    wx.redirectTo({
      url: '/pages/login/login'
    })
    return Promise.reject(new Error('未登录或登录已过期'))
  }
  return response.data
}

// 统一的请求方法
function request(options) {
  options = requestInterceptor(options)

  return new Promise((resolve, reject) => {
    wx.request({
      ...config,
      ...options,
      success: (res) => {
        try {
          resolve(responseInterceptor(res))
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}

// 导出请求方法
module.exports = {
  get: (url, data) => request({
    url,
    method: 'GET',
    data
  }),

  post: (url, data) => request({
    url,
    method: 'POST',
    data
  }),

  put: (url, data) => request({
    url,
    method: 'PUT',
    data
  }),

  delete: (url, data) => request({
    url,
    method: 'DELETE',
    data
  })
} 