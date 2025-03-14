package com.efficiency.tools.controller;

import com.efficiency.tools.dto.UserDTO;
import com.efficiency.tools.model.User;
import com.efficiency.tools.security.JwtTokenProvider;
import com.efficiency.tools.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Api(tags = "用户接口")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @ApiOperation("用户登录")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserDTO userDTO) {
        User user = userService.login(userDTO);
        String token = tokenProvider.generateToken(user.getOpenid());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @ApiOperation("获取用户信息")
    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        String openid = (String) authentication.getPrincipal();
        User user = userService.getUserByOpenid(openid);
        return ResponseEntity.ok(user);
    }

    @ApiOperation("更新用户配置")
    @PutMapping("/config")
    public ResponseEntity<?> updateConfig(
            Authentication authentication,
            @Valid @RequestBody UserDTO.UserConfigDTO config) {
        String openid = (String) authentication.getPrincipal();
        User user = userService.updateUserConfig(openid, config);
        return ResponseEntity.ok(user);
    }
} 