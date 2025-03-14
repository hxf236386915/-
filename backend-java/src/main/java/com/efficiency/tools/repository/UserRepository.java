package com.efficiency.tools.repository;

import com.efficiency.tools.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByOpenid(String openid);
} 