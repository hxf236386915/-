const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  unionid: {
    type: String,
    sparse: true
  },
  nickName: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  firstLoginTime: {
    type: Date,
    default: Date.now
  },
  lastLoginTime: {
    type: Date,
    default: Date.now
  },
  config: {
    flomo: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: {
        type: String,
        default: ''
      }
    },
    notion: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: {
        type: String,
        default: ''
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 