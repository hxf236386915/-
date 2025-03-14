const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 用户登录
router.post('/login', userController.login);

// 获取用户信息（需要认证）
router.get('/info', auth, userController.getUserInfo);

// 更新用户配置（需要认证）
router.put('/config', auth, userController.updateConfig);

module.exports = router; 