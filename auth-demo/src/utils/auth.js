import CryptoJS from 'crypto-js'

const TokenKey = 'User-Token'
const StoragePrefix = 'auth_demo_'

// Token操作
export function getToken() {
  let token = ''
  // #ifdef H5
  token = localStorage.getItem(TokenKey)
  // #endif
  
  // #ifdef MP-WEIXIN
  token = uni.getStorageSync(TokenKey)
  // #endif
  
  return token
}

export function setToken(token) {
  // #ifdef H5
  localStorage.setItem(TokenKey, token)
  // #endif
  
  // #ifdef MP-WEIXIN
  uni.setStorageSync(TokenKey, token)
  // #endif
}

export function removeToken() {
  // #ifdef H5
  localStorage.removeItem(TokenKey)
  // #endif
  
  // #ifdef MP-WEIXIN
  uni.removeStorageSync(TokenKey)
  // #endif
}

// 数据加密
export function encrypt(data) {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.VUE_APP_SECRET_KEY
  ).toString()
}

// 数据解密
export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(
    ciphertext,
    process.env.VUE_APP_SECRET_KEY
  )
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

// 存储加密数据
export function setEncryptStorage(key, value) {
  const encryptedData = encrypt(value)
  // #ifdef H5
  localStorage.setItem(StoragePrefix + key, encryptedData)
  // #endif
  
  // #ifdef MP-WEIXIN
  uni.setStorageSync(StoragePrefix + key, encryptedData)
  // #endif
}

// 获取解密数据
export function getEncryptStorage(key) {
  let encryptedData = ''
  // #ifdef H5
  encryptedData = localStorage.getItem(StoragePrefix + key)
  // #endif
  
  // #ifdef MP-WEIXIN
  encryptedData = uni.getStorageSync(StoragePrefix + key)
  // #endif
  
  return encryptedData ? decrypt(encryptedData) : null
} 