const app = getApp()

Page({
  data: {
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [],
    selectedDate: new Date().toISOString().split('T')[0],
    isWeekMode: false,
    currentWeekDays: [], // 当前周的日期数组
    todos: [],
    notes: [],
    headerText: ''
  },

  onLoad() {
    // 默认显示当前周
    this.setData({ isWeekMode: true })
    this.initCalendar()
    this.loadDateContent(this.data.selectedDate)
  },

  // 初始化日历数据
  initCalendar() {
    const { currentYear, currentMonth } = this.data
    const days = []
    const today = new Date().toISOString().split('T')[0]
    
    // 获取当月第一天是星期几
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay()
    // 获取当月天数
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    // 获取上月天数
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate()

    // 添加上月剩余天数
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(currentYear, currentMonth - 2, day).toISOString().split('T')[0]
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: date === today,
        isSelected: date === this.data.selectedDate,
        hasItems: this.checkDateHasItems(date)
      })
    }

    // 添加当月天数
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i).toISOString().split('T')[0]
      days.push({
        day: i,
        date,
        isCurrentMonth: true,
        isToday: date === today,
        isSelected: date === this.data.selectedDate,
        hasItems: this.checkDateHasItems(date)
      })
    }

    // 添加下月开始天数
    const remainingDays = 42 - days.length // 保持6行日历
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth, i).toISOString().split('T')[0]
      days.push({
        day: i,
        date,
        isCurrentMonth: false,
        isToday: date === today,
        isSelected: date === this.data.selectedDate,
        hasItems: this.checkDateHasItems(date)
      })
    }

    this.setData({ calendarDays: days })
    
    // 初始化当前周数据
    this.initCurrentWeek(today)
  },

  // 初始化当前周数据
  initCurrentWeek(dateString) {
    const date = new Date(dateString)
    const day = date.getDay()
    const diff = date.getDate() - day
    const weekDays = []

    // 获取本周的7天日期
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), diff + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      weekDays.push({
        day: currentDate.getDate(),
        date: dateStr,
        isCurrentMonth: currentDate.getMonth() === this.data.currentMonth - 1,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === this.data.selectedDate,
        hasItems: this.checkDateHasItems(dateStr)
      })
    }

    // 更新年月显示
    const firstDate = new Date(weekDays[0].date)
    const lastDate = new Date(weekDays[6].date)
    let headerText = ''
    
    if (firstDate.getMonth() === lastDate.getMonth()) {
      // 同一个月
      this.setData({
        currentYear: firstDate.getFullYear(),
        currentMonth: firstDate.getMonth() + 1
      })
    } else {
      // 跨月
      headerText = `${firstDate.getMonth() + 1}月-${lastDate.getMonth() + 1}月`
      this.setData({
        currentYear: firstDate.getFullYear(),
        currentMonth: firstDate.getMonth() + 1,
        headerText
      })
    }

    this.setData({ currentWeekDays: weekDays })
  },

  // 切换日历模式
  toggleCalendarMode() {
    const isWeekMode = !this.data.isWeekMode
    this.setData({ isWeekMode })
    
    if (isWeekMode) {
      // 切换到周视图时，确保显示选中日期所在的周
      this.initCurrentWeek(this.data.selectedDate)
    } else {
      // 切换到月视图时，更新年月显示
      const date = new Date(this.data.selectedDate)
      this.setData({
        currentYear: date.getFullYear(),
        currentMonth: date.getMonth() + 1,
        headerText: ''
      })
    }
  },

  // 处理日历滚动
  handleCalendarScroll(e) {
    // 根据滚动位置自动切换到周视图
    if (e.detail.scrollTop > 100 && !this.data.isWeekMode) {
      this.toggleCalendarMode()
    }
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date
    this.setData({
      selectedDate: date,
      calendarDays: this.data.calendarDays.map(day => ({
        ...day,
        isSelected: day.date === date
      }))
    })
    
    // 更新周视图数据
    if (this.data.isWeekMode) {
      this.initCurrentWeek(date)
    }
    
    this.loadDateContent(date)
  },

  // 加载选中日期的内容
  async loadDateContent(date) {
    try {
      const res = await this.getDateContent(date)
      this.setData({
        todos: res.todos,
        notes: res.notes
      })
    } catch (error) {
      console.error('加载日期内容失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 检查日期是否有待办或笔记
  async checkDateHasItems(date) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'checkDateItems',
        data: { date }
      })
      
      return {
        hasTodos: res.result.hasTodos,
        hasNotes: res.result.hasNotes
      }
    } catch (error) {
      console.error('检查日期内容失败:', error)
      return {
        hasTodos: false,
        hasNotes: false
      }
    }
  },

  // 获取日期内容
  async getDateContent(date) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getDateContent',
        data: { date }
      })
      
      return res.result
    } catch (error) {
      console.error('获取日期内容失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      return {
        todos: [],
        notes: []
      }
    }
  },

  // 切换待办状态
  async toggleTodoStatus(e) {
    const { id } = e.currentTarget.dataset
    try {
      await wx.cloud.callFunction({
        name: 'toggleTodo',
        data: { id }
      })
      
      // 更新本地数据
      const todos = this.data.todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed }
        }
        return todo
      })
      
      this.setData({ todos })
    } catch (error) {
      console.error('更新待办状态失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 查看笔记详情
  viewNote(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/note/edit?id=${id}&date=${this.data.selectedDate}`
    })
  },

  // 显示添加菜单
  showAddMenu() {
    wx.showActionSheet({
      itemList: ['添加待办', '添加笔记'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.navigateToAddTodo()
        } else {
          this.navigateToAddNote()
        }
      }
    })
  },

  // 跳转到添加待办页面
  navigateToAddTodo() {
    wx.navigateTo({
      url: `/pages/todo/add?date=${this.data.selectedDate}`
    })
  },

  // 跳转到添加笔记页面
  navigateToAddNote() {
    wx.navigateTo({
      url: `/pages/note/add?date=${this.data.selectedDate}`
    })
  },

  // 格式化日期显示
  formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = this.data.weekdays[date.getDay()]
    return `${year}年${month}月${day}日 星期${weekday}`
  }
}) 