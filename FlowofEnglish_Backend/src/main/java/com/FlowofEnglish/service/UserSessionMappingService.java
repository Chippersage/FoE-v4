package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSessionMapping;

import java.util.List;
import java.util.Optional;

public interface UserSessionMappingService {
    List<UserSessionMapping> getAllUserSessionMappings();
    Optional<UserSessionMapping> getUserSessionMappingById(int sessionId);
    UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping);
    UserSessionMapping updateUserSessionMapping(int sessionId, UserSessionMapping userSessionMapping);
    void deleteUserSessionMapping(int sessionId);
}
