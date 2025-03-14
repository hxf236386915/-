package com.efficiency.tools.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String openid;
    
    private String unionid;
    private String nickName;
    private String avatarUrl;
    private LocalDateTime firstLoginTime;
    private LocalDateTime lastLoginTime;
    private UserConfig config;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data
class UserConfig {
    private ServiceConfig flomo;
    private ServiceConfig notion;
}

@Data
class ServiceConfig {
    private boolean enabled;
    private String apiKey;
} 