package com.efficiency.tools.service.impl;

import com.efficiency.tools.dto.UserDTO;
import com.efficiency.tools.model.User;
import com.efficiency.tools.repository.UserRepository;
import com.efficiency.tools.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User login(UserDTO userDTO) {
        User user = userRepository.findByOpenid(userDTO.getOpenid())
                .orElse(new User());

        if (user.getId() == null) {
            // 新用户，设置首次登录时间
            user.setFirstLoginTime(LocalDateTime.now());
            user.setCreatedAt(LocalDateTime.now());
        }

        // 更新用户信息
        user.setOpenid(userDTO.getOpenid());
        user.setUnionid(userDTO.getUnionid());
        user.setNickName(userDTO.getNickName());
        user.setAvatarUrl(userDTO.getAvatarUrl());
        user.setLastLoginTime(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    @Override
    public User getUserByOpenid(String openid) {
        return userRepository.findByOpenid(openid)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUserConfig(String openid, UserDTO.UserConfigDTO config) {
        User user = getUserByOpenid(openid);
        user.setConfig(config);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
} 