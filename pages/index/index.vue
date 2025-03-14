<template>
  <view class="container">
    <text class="title">首页</text>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  onLoad() {
    // 页面加载时检查登录状态
    const token = uni.getStorageSync('User-Token')
    if (!token) {
      uni.redirectTo({
        url: '/pages/auth/login'
      })
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
</style> 