const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    // 模拟微信登录，实际项目中需要调用微信API获取openid
    const openid = `test_openid_${Date.now()}`;

    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      user = await User.create({
        openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
    } else {
      // 更新用户信息
      user.lastLoginAt = new Date();
      if (userInfo.nickName) user.nickName = userInfo.nickName;
      if (userInfo.avatarUrl) user.avatarUrl = userInfo.avatarUrl;
      await user.save();
    }

    // 生成token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      userInfo: {
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      config: user.config
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      message: '登录失败，请稍后重试'
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ openid: req.user.openid });
    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      });
    }

    res.json({
      userInfo: {
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      config: user.config
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      message: '获取用户信息失败'
    });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { config } = req.body;
    const user = await User.findOne({ openid: req.user.openid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    user.config = config;
    await user.save();

    res.json({
      success: true,
      data: {
        config: user.config
      }
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({
      success: false,
      message: '更新配置失败'
    });
  }
}; 