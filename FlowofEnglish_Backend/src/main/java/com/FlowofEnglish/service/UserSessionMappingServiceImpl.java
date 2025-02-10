package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSessionMapping;
import com.FlowofEnglish.repository.UserSessionMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
    public List<UserSessionMapping> getUserSessionMappingsByUserId(String userId) {
        return userSessionMappingRepository.findByUser_UserId(userId);
    }
    @Override
    public Optional<UserSessionMapping> findActiveSessionByUserIdAndCohortId(String userId, String cohortId) {
        return userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(
            userId, cohortId);
    }
    
    @Override
    public void invalidateSession(String sessionId) {
        userSessionMappingRepository.findBySessionId(sessionId)
            .ifPresent(session -> {
                session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
                userSessionMappingRepository.save(session);
            });
    }

    @Override
    public UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.save(userSessionMapping);
    }

    @Override
    public Optional<UserSessionMapping> findBySessionId(String sessionId) {
        return userSessionMappingRepository.findBySessionId(sessionId);
    }
    
    @Override
    public UserSessionMapping updateUserSessionMapping(String sessionId, UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.findById(sessionId).map(existingMapping -> {
            existingMapping.setSessionEndTimestamp(userSessionMapping.getSessionEndTimestamp());
            existingMapping.setSessionStartTimestamp(userSessionMapping.getSessionStartTimestamp());
            existingMapping.setUuid(userSessionMapping.getUuid());
            existingMapping.setSessionId(userSessionMapping.getSessionId());
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
