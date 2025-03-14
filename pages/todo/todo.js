Page({
  data: {
    todos: [],
    newTodo: '',
    loading: false
  },

  onLoad() {
    this.loadTodos()
  },

  onShow() {
    this.loadTodos()
  },

  // 加载待办事项
  async loadTodos() {
    this.setData({ loading: true })
    try {
      // 这里应该调用实际的API
      // 目前使用模拟数据
      const mockTodos = [
        {
          id: 1,
          content: '完成小程序开发',
          completed: false,
          createTime: '2024-03-20'
        },
        {
          id: 2,
          content: '学习新技术',
          completed: true,
          createTime: '2024-03-19'
        }
      ]

      this.setData({
        todos: mockTodos
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 输入新待办事项
  inputTodo(e) {
    this.setData({
      newTodo: e.detail.value
    })
  },

  // 添加待办事项
  async addTodo() {
    const { newTodo } = this.data
    if (!newTodo.trim()) {
      return
    }

    try {
      // 这里应该调用实际的API
      const mockNewTodo = {
        id: Date.now(),
        content: newTodo,
        completed: false,
        createTime: new Date().toISOString().split('T')[0]
      }

      this.setData({
        todos: [mockNewTodo, ...this.data.todos],
        newTodo: ''
      })

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  },

  // 切换待办事项状态
  async toggleTodo(e) {
    const { id } = e.currentTarget.dataset
    try {
      const todos = this.data.todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed }
        }
        return todo
      })

      this.setData({ todos })
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 删除待办事项
  async deleteTodo(e) {
    const { id } = e.currentTarget.dataset
    try {
      const todos = this.data.todos.filter(todo => todo.id !== id)
      this.setData({ todos })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }
}) 