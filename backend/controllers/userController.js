const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { openid, unionid, nickName, avatarUrl } = req.body;

    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      // 首次登录，创建新用户
      user = new User({
        openid,
        unionid,
        nickName,
        avatarUrl,
        firstLoginTime: new Date()
      });
    }

    // 更新最后登录时间
    user.lastLoginTime = new Date();
    user.nickName = nickName;
    user.avatarUrl = avatarUrl;
    if (unionid) user.unionid = unionid;
    
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id, openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          openid: user.openid,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          firstLoginTime: user.firstLoginTime,
          lastLoginTime: user.lastLoginTime,
          config: user.config
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ openid: req.user.openid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        openid: user.openid,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        firstLoginTime: user.firstLoginTime,
        lastLoginTime: user.lastLoginTime,
        config: user.config
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
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