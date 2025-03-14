package com.efficiency.tools.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    @NotBlank
    private String openid;
    private String unionid;
    @NotBlank
    private String nickName;
    @NotBlank
    private String avatarUrl;
    private LocalDateTime firstLoginTime;
    private LocalDateTime lastLoginTime;
    private UserConfigDTO config;
}

@Data
class UserConfigDTO {
    private ServiceConfigDTO flomo;
    private ServiceConfigDTO notion;
}

@Data
class ServiceConfigDTO {
    private boolean enabled;
    private String apiKey;
} 