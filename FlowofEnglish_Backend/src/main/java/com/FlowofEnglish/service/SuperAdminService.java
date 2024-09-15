package com.FlowofEnglish.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.FlowofEnglish.model.SuperAdmin;

public interface SuperAdminService {
    SuperAdmin createSuperAdmin(SuperAdmin superAdmin);
    SuperAdmin findByUserId(String userId);
    boolean verifyPassword(String rawPassword, String encodedPassword);
    SuperAdmin updateSuperAdmin(SuperAdmin superAdmin); // Add this method
    BCryptPasswordEncoder getPasswordEncoder(); // Add this method
}
