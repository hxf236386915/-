import { setToken, getToken, removeToken } from '@/utils/auth'
import { wxLogin, phoneLogin, getUserInfo } from '@/api/auth'

const state = {
  token: getToken(),
  userInfo: null,
  settings: {
    theme: 'light',
    fontSize: 'medium',
    notification: true,
    syncFrequency: 'realtime'
  }
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, info) => {
    state.userInfo = info
  },
  SET_SETTINGS: (state, settings) => {
    state.settings = { ...state.settings, ...settings }
  },
  CLEAR_USER: (state) => {
    state.token = ''
    state.userInfo = null
  }
}

const actions = {
  // 微信登录
  async wxLoginAction({ commit }, code) {
    try {
      const { data } = await wxLogin(code)
      commit('SET_TOKEN', data.token)
      setToken(data.token)
      return data
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  },

  // 手机号登录
  async phoneLoginAction({ commit }, loginData) {
    try {
      const { data } = await phoneLogin(loginData)
      commit('SET_TOKEN', data.token)
      setToken(data.token)
      return data
    } catch (error) {
      console.error('手机号登录失败:', error)
      throw error
    }
  },

  // 获取用户信息
  async getUserInfoAction({ commit }) {
    try {
      const { data } = await getUserInfo()
      commit('SET_USER_INFO', data)
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // 更新设置
  updateSettings({ commit }, settings) {
    commit('SET_SETTINGS', settings)
  },

  // 退出登录
  logout({ commit }) {
    removeToken()
    commit('CLEAR_USER')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 