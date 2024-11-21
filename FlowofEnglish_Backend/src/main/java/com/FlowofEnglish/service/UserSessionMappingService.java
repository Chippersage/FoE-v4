package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSessionMapping;

import java.util.List;
import java.util.Optional;

public interface UserSessionMappingService {
	
    List<UserSessionMapping> getAllUserSessionMappings();
    Optional<UserSessionMapping> getUserSessionMappingById(String sessionId);
    List<UserSessionMapping> getUserSessionMappingsByUserId(String userId);
    
    Optional<UserSessionMapping> findBySessionId(String sessionId);
    UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping);
    UserSessionMapping updateUserSessionMapping(String sessionId, UserSessionMapping userSessionMapping);
    void deleteUserSessionMapping(String sessionId);
}
