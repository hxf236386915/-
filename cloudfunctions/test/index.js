// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
try {
  cloud.init({
    env: 'xiaolvxiaogongju-9fryvqi78a6816d'
  })
  console.log('Cloud initialized successfully')
} catch (error) {
  console.error('Failed to initialize cloud:', error)
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 打印输入参数
    console.log('Function started')
    console.log('Event:', JSON.stringify(event))
    console.log('Context:', JSON.stringify(context))
    
    // 获取微信上下文
    let wxContext
    try {
      wxContext = cloud.getWXContext()
      console.log('WXContext:', JSON.stringify(wxContext))
    } catch (error) {
      console.error('Failed to get WXContext:', error)
      wxContext = {}
    }

    // 构建返回结果
    const result = {
      success: true,
      event: event,
      openid: wxContext.OPENID || null,
      appid: wxContext.APPID || null,
      unionid: wxContext.UNIONID || null,
      env: cloud.DYNAMIC_CURRENT_ENV || null,
      timestamp: new Date().toISOString(),
      version: '1.0.1'
    }
    
    console.log('Returning result:', JSON.stringify(result))
    return result
    
  } catch (error) {
    // 错误处理
    console.error('Function failed:', error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      version: '1.0.1'
    }
  }
} 