package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSessionMapping;
import com.FlowofEnglish.repository.UserSessionMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserSessionMappingServiceImpl implements UserSessionMappingService {

    @Autowired
    private UserSessionMappingRepository userSessionMappingRepository;

    @Override
    public List<UserSessionMapping> getAllUserSessionMappings() {
        return userSessionMappingRepository.findAll();
    }

    @Override
    public Optional<UserSessionMapping> getUserSessionMappingById(String sessionId) {
        return userSessionMappingRepository.findById(sessionId);
    }

    @Override
    public UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.save(userSessionMapping);
    }

    
    @Override
    public UserSessionMapping updateUserSessionMapping(String sessionId, UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.findById(sessionId).map(existingMapping -> {
            existingMapping.setSessionEndTimestamp(userSessionMapping.getSessionEndTimestamp());
            existingMapping.setSessionStartTimestamp(userSessionMapping.getSessionStartTimestamp());
            existingMapping.setUuid(userSessionMapping.getUuid());
            existingMapping.setSessionId(userSessionMapping.getSessionId());  // Ensure sessionId is updated
            existingMapping.setCohort(userSessionMapping.getCohort());
            existingMapping.setUser(userSessionMapping.getUser());
            return userSessionMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("UserSessionMapping not found"));
    }

    @Override
    public void deleteUserSessionMapping(String sessionId) {
        userSessionMappingRepository.deleteById(sessionId);
    }
}
