const request = require('./request')

// Flomo API
const flomoApi = {
  // 添加笔记
  addNote: (content) => {
    const app = getApp()
    const { apiKey } = app.globalData.config.flomo
    
    return request.post('/flomo/notes', {
      content,
      api_key: apiKey
    })
  },

  // 获取笔记列表
  getNotes: (params) => {
    const app = getApp()
    const { apiKey } = app.globalData.config.flomo
    
    return request.get('/flomo/notes', {
      ...params,
      api_key: apiKey
    })
  }
}

// Notion API
const notionApi = {
  // 添加页面
  addPage: (data) => {
    const app = getApp()
    const { apiKey } = app.globalData.config.notion
    
    return request.post('/notion/pages', {
      ...data,
      api_key: apiKey
    })
  },

  // 获取数据库内容
  getDatabase: (databaseId, params) => {
    const app = getApp()
    const { apiKey } = app.globalData.config.notion
    
    return request.get(`/notion/databases/${databaseId}`, {
      ...params,
      api_key: apiKey
    })
  }
}

// 用户相关API
const userApi = {
  // 登录
  login: (data) => {
    return request.post('/user/login', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get('/user/info')
  },

  // 更新用户信息
  updateUserInfo: (data) => {
    return request.put('/user/info', data)
  }
}

// 待办事项API
const todoApi = {
  // 获取待办列表
  getTodos: (params) => {
    return request.get('/todos', params)
  },

  // 添加待办
  addTodo: (data) => {
    return request.post('/todos', data)
  },

  // 更新待办
  updateTodo: (id, data) => {
    return request.put(`/todos/${id}`, data)
  },

  // 删除待办
  deleteTodo: (id) => {
    return request.delete(`/todos/${id}`)
  }
}

module.exports = {
  flomoApi,
  notionApi,
  userApi,
  todoApi
} 