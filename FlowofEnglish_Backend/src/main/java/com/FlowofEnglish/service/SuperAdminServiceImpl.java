package com.FlowofEnglish.service;

import com.FlowofEnglish.model.SuperAdmin;
import com.FlowofEnglish.repository.SuperAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SuperAdminServiceImpl implements SuperAdminService {

    @Autowired
    private SuperAdminRepository superAdminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public SuperAdmin createSuperAdmin(SuperAdmin superAdmin) {
        // Hash the password before saving
        superAdmin.setPassword(passwordEncoder.encode(superAdmin.getPassword()));
        return superAdminRepository.save(superAdmin);
    }

    @Override
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    public SuperAdmin findByUserId(String userId) {
        return superAdminRepository.findByUserId(userId);
    }

    @Override
    public SuperAdmin updateSuperAdmin(SuperAdmin superAdmin) {
        return superAdminRepository.save(superAdmin); // Save the updated SuperAdmin
    }

    @Override
    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder; // Provide access to the password encoder
    }
}
