<template>
  <view class="settings-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <image :src="userInfo.avatarUrl" mode="aspectFill" class="avatar"></image>
        <text class="edit-text">点击修改</text>
      </view>
      <view class="info-wrapper">
        <input 
          type="text" 
          v-model="userInfo.nickName" 
          placeholder="请输入昵称" 
          class="nickname-input"
        />
        <textarea 
          v-model="userInfo.signature" 
          placeholder="请输入个性签名" 
          class="signature-input"
        />
      </view>
      <button class="save-btn" @click="handleSaveUserInfo">保存修改</button>
    </view>
    
    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 主题设置 -->
      <view class="settings-item">
        <text class="item-label">主题设置</text>
        <picker 
          :value="themeIndex" 
          :range="themeOptions" 
          @change="handleThemeChange"
        >
          <view class="picker-value">
            {{themeOptions[themeIndex]}}
            <text class="iconfont icon-right"></text>
          </view>
        </picker>
      </view>
      
      <!-- 字体大小 -->
      <view class="settings-item">
        <text class="item-label">字体大小</text>
        <picker 
          :value="fontSizeIndex" 
          :range="fontSizeOptions" 
          @change="handleFontSizeChange"
        >
          <view class="picker-value">
            {{fontSizeOptions[fontSizeIndex]}}
            <text class="iconfont icon-right"></text>
          </view>
        </picker>
      </view>
      
      <!-- 消息通知 -->
      <view class="settings-item">
        <text class="item-label">消息通知</text>
        <switch 
          :checked="settings.notification" 
          @change="handleNotificationChange"
        />
      </view>
      
      <!-- 同步频率 -->
      <view class="settings-item">
        <text class="item-label">同步频率</text>
        <picker 
          :value="syncFrequencyIndex" 
          :range="syncFrequencyOptions" 
          @change="handleSyncFrequencyChange"
        >
          <view class="picker-value">
            {{syncFrequencyOptions[syncFrequencyIndex]}}
            <text class="iconfont icon-right"></text>
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 第三方平台账号 -->
    <view class="platform-list">
      <view class="section-title">第三方平台账号</view>
      <view 
        class="platform-item" 
        v-for="platform in platforms" 
        :key="platform.id"
      >
        <view class="platform-info">
          <image :src="platform.icon" class="platform-icon"></image>
          <text class="platform-name">{{platform.name}}</text>
        </view>
        <button 
          class="platform-btn" 
          :class="platform.isBound ? 'unbind-btn' : 'bind-btn'"
          @click="handlePlatformAction(platform)"
        >
          {{platform.isBound ? '解绑' : '绑定'}}
        </button>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </view>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      themeOptions: ['浅色模式', '深色模式'],
      themeIndex: 0,
      fontSizeOptions: ['小', '中', '大'],
      fontSizeIndex: 1,
      syncFrequencyOptions: ['实时', '每小时', '每天'],
      syncFrequencyIndex: 0,
      platforms: [
        {
          id: 'flomo',
          name: 'Flomo',
          icon: '/static/platform/flomo.png',
          isBound: false
        },
        {
          id: 'notion',
          name: 'Notion',
          icon: '/static/platform/notion.png',
          isBound: false
        },
        {
          id: 'dida',
          name: '滴答清单',
          icon: '/static/platform/dida.png',
          isBound: false
        }
      ]
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo', 'settings'])
  },
  
  methods: {
    ...mapActions('user', [
      'updateUserInfo',
      'updateSettings',
      'bindThirdParty',
      'unbindThirdParty',
      'logout'
    ]),
    
    // 保存用户信息
    async handleSaveUserInfo() {
      try {
        await this.updateUserInfo(this.userInfo)
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 主题切换
    handleThemeChange(e) {
      this.themeIndex = e.detail.value
      this.updateSettings({
        theme: this.themeIndex === 0 ? 'light' : 'dark'
      })
    },
    
    // 字体大小切换
    handleFontSizeChange(e) {
      this.fontSizeIndex = e.detail.value
      const sizes = ['small', 'medium', 'large']
      this.updateSettings({
        fontSize: sizes[this.fontSizeIndex]
      })
    },
    
    // 通知开关切换
    handleNotificationChange(e) {
      this.updateSettings({
        notification: e.detail.value
      })
    },
    
    // 同步频率切换
    handleSyncFrequencyChange(e) {
      this.syncFrequencyIndex = e.detail.value
      const frequencies = ['realtime', 'hourly', 'daily']
      this.updateSettings({
        syncFrequency: frequencies[this.syncFrequencyIndex]
      })
    },
    
    // 处理平台绑定/解绑
    async handlePlatformAction(platform) {
      try {
        if (platform.isBound) {
          await this.unbindThirdParty(platform.id)
          platform.isBound = false
          uni.showToast({
            title: '解绑成功',
            icon: 'success'
          })
        } else {
          // 这里需要根据不同平台调用不同的授权流程
          await this.bindThirdParty({
            platformId: platform.id,
            // 其他授权参数
          })
          platform.isBound = true
          uni.showToast({
            title: '绑定成功',
            icon: 'success'
          })
        }
      } catch (error) {
        uni.showToast({
          title: platform.isBound ? '解绑失败' : '绑定失败',
          icon: 'none'
        })
      }
    },
    
    // 退出登录
    async handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.logout()
            uni.reLaunch({
              url: '/pages/auth/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 30rpx;
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  
  .avatar-wrapper {
    text-align: center;
    margin-bottom: 30rpx;
    position: relative;
    display: inline-block;
    
    .avatar {
      width: 150rpx;
      height: 150rpx;
      border-radius: 75rpx;
    }
    
    .edit-text {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 24rpx;
      padding: 6rpx 0;
    }
  }
  
  .info-wrapper {
    margin-bottom: 30rpx;
    
    .nickname-input {
      height: 88rpx;
      border-bottom: 2rpx solid #eee;
      margin-bottom: 20rpx;
      padding: 0 20rpx;
    }
    
    .signature-input {
      width: 100%;
      height: 150rpx;
      border: 2rpx solid #eee;
      border-radius: 10rpx;
      padding: 20rpx;
    }
  }
  
  .save-btn {
    background: #07c160;
    color: #fff;
    border-radius: 44rpx;
  }
}

.settings-list {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  
  .settings-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 2rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-label {
      color: #333;
      font-size: 28rpx;
    }
    
    .picker-value {
      color: #666;
      font-size: 28rpx;
      
      .icon-right {
        margin-left: 10rpx;
      }
    }
  }
}

.platform-list {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
  
  .platform-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .platform-info {
      display: flex;
      align-items: center;
      
      .platform-icon {
        width: 60rpx;
        height: 60rpx;
        margin-right: 20rpx;
      }
      
      .platform-name {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .platform-btn {
      width: 160rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 24rpx;
      border-radius: 30rpx;
      
      &.bind-btn {
        background: #07c160;
        color: #fff;
      }
      
      &.unbind-btn {
        background: #f5f5f5;
        color: #666;
      }
    }
  }
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #ff4d4f;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style> 