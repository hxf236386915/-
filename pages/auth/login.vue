<template>
  <view class="login-container">
    <view class="logo">
      <image src="/static/logo.png" mode="aspectFit"></image>
    </view>
    
    <!-- 微信登录按钮 -->
    <button 
      class="login-btn wx-btn" 
      open-type="getUserInfo" 
      @getuserinfo="handleWxLogin"
    >
      微信一键登录
    </button>
    
    <!-- 手机号登录按钮 -->
    <button 
      class="login-btn phone-btn" 
      @click="showPhoneLogin"
    >
      手机号登录
    </button>
    
    <!-- 手机号登录弹窗 -->
    <uni-popup ref="phonePopup" type="center">
      <view class="phone-form">
        <view class="form-item">
          <input 
            type="number" 
            v-model="phone" 
            placeholder="请输入手机号"
          />
        </view>
        <view class="form-item code-item">
          <input 
            type="number" 
            v-model="code" 
            placeholder="请输入验证码"
          />
          <button 
            class="code-btn" 
            :disabled="counting" 
            @click="getCode"
          >
            {{counting ? `${counter}s` : '获取验证码'}}
          </button>
        </view>
        <button 
          class="submit-btn" 
          @click="handlePhoneLogin"
        >
          登录
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      phone: '',
      code: '',
      counting: false,
      counter: 60
    }
  },
  
  methods: {
    ...mapActions('user', ['wxLoginAction', 'phoneLoginAction', 'getUserInfoAction']),
    
    // 处理微信登录
    async handleWxLogin(e) {
      if (e.detail.errMsg !== 'getUserInfo:ok') {
        uni.showToast({
          title: '微信登录授权失败',
          icon: 'none'
        })
        return
      }
      
      try {
        const { code } = await uni.login()
        await this.wxLoginAction(code)
        await this.getUserInfoAction()
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    },
    
    // 显示手机号登录弹窗
    showPhoneLogin() {
      this.$refs.phonePopup.open()
    },
    
    // 获取验证码
    async getCode() {
      if (!this.phone || !/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        // 这里调用获取验证码的API
        await this.startCount()
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '验证码发送失败',
          icon: 'none'
        })
      }
    },
    
    // 开始倒计时
    startCount() {
      this.counting = true
      this.counter = 60
      const timer = setInterval(() => {
        this.counter--
        if (this.counter <= 0) {
          this.counting = false
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 处理手机号登录
    async handlePhoneLogin() {
      if (!this.phone || !this.code) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      try {
        await this.phoneLoginAction({
          phone: this.phone,
          code: this.code
        })
        await this.getUserInfoAction()
        
        this.$refs.phonePopup.close()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.login-container {
  padding: 60rpx;
  
  .logo {
    text-align: center;
    margin-bottom: 80rpx;
    
    image {
      width: 200rpx;
      height: 200rpx;
    }
  }
  
  .login-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    margin-bottom: 30rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    
    &.wx-btn {
      background: #07c160;
      color: #fff;
    }
    
    &.phone-btn {
      background: #fff;
      color: #333;
      border: 2rpx solid #ddd;
    }
  }
}

.phone-form {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
  width: 600rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    input {
      width: 100%;
      height: 88rpx;
      border: 2rpx solid #eee;
      border-radius: 44rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
    }
    
    &.code-item {
      display: flex;
      align-items: center;
      
      input {
        flex: 1;
        margin-right: 20rpx;
      }
      
      .code-btn {
        width: 200rpx;
        height: 88rpx;
        line-height: 88rpx;
        font-size: 28rpx;
        background: #f5f5f5;
        color: #666;
        
        &[disabled] {
          background: #eee;
          color: #999;
        }
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #07c160;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
  }
}
</style> 