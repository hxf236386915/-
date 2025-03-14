package com.efficiency.tools.service;

import com.efficiency.tools.dto.UserDTO;
import com.efficiency.tools.model.User;

public interface UserService {
    User login(UserDTO userDTO);
    User getUserByOpenid(String openid);
    User updateUserConfig(String openid, UserDTO.UserConfigDTO config);
} 