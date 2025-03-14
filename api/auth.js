import request from '@/utils/request'

// 微信登录
export function wxLogin(code) {
  return request({
    url: '/api/auth/wx-login',
    method: 'post',
    data: { code }
  })
}

// 手机号登录
export function phoneLogin(data) {
  return request({
    url: '/api/auth/phone-login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/api/user/update',
    method: 'put',
    data
  })
}

// 更新用户设置
export function updateUserSettings(data) {
  return request({
    url: '/api/user/settings',
    method: 'put',
    data
  })
}

// 绑定第三方平台
export function bindThirdParty(data) {
  return request({
    url: '/api/user/bind-platform',
    method: 'post',
    data
  })
}

// 解绑第三方平台
export function unbindThirdParty(platformId) {
  return request({
    url: '/api/user/unbind-platform',
    method: 'post',
    data: { platformId }
  })
} 