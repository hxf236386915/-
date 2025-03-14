<template>
  <view>
    <view class="container">
      <router-view></router-view>
    </view>
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 引入字体图标 */
@import './static/iconfont/iconfont.css';

/* 全局样式 */
page {
  background: #f5f5f5;
  font-size: 28rpx;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
}

.container {
  width: 100%;
  min-height: 100vh;
}
</style> 