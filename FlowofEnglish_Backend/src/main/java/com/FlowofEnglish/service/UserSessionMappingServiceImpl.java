package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.UserSessionMappingRepository;

import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class UserSessionMappingServiceImpl implements UserSessionMappingService {

    @Autowired
    private UserSessionMappingRepository userSessionMappingRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(UserSessionMappingServiceImpl.class);

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
//    @Override
//    public Optional<UserSessionMapping> findActiveSessionByUserIdAndCohortId(String userId, String cohortId) {
//        return userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(
//            userId, cohortId);
//    }
//    
//    @Override
//    public void invalidateSession(String sessionId) {
//        userSessionMappingRepository.findBySessionId(sessionId)
//            .ifPresent(session -> {
//                session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
//                userSessionMappingRepository.save(session);
//            });
//    }
    @Override
    public List<UserSessionMapping> findActiveSessionsByUserIdAndCohortId(String userId, String cohortId) {
        // This should return all active sessions for the given userId and cohortId
        return userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(userId, cohortId);
    }
    
    @Override
    public List<UserSessionMapping> findActiveSessionsForCleanup() {
        // You'll need to add this method to your repository
        return userSessionMappingRepository.findBySessionEndTimestampIsNull();
    }
    
    @Override
    public void invalidateSession(String sessionId) {
        Optional<UserSessionMapping> sessionOpt = userSessionMappingRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionMapping session = sessionOpt.get();
            session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            userSessionMappingRepository.save(session);
        }
    }
    @Override
    public void invalidateAllActiveSessions(String userId, String cohortId) {
        List<UserSessionMapping> activeSessions = findActiveSessionsByUserIdAndCohortId(userId, cohortId);
        for (UserSessionMapping session : activeSessions) {
            session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            userSessionMappingRepository.save(session);
        }
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
    
 // Add this method to your UserSessionMappingService implementation class

    @Override
    public void invalidateAllUserSessions(String userId) {
        try {
            logger.info("Invalidating all sessions for user: {}", userId);
            
            // Get all active sessions for the user
            List<UserSessionMapping> userSessions = getUserSessionMappingsByUserId(userId);
            
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            
            for (UserSessionMapping session : userSessions) {
                // Only invalidate sessions that are still active (no end timestamp)
                if (session.getSessionEndTimestamp() == null) {
                    session.setSessionEndTimestamp(now);
                    userSessionMappingRepository.save(session);
                    logger.debug("Invalidated session: {} for user: {}", session.getSessionId(), userId);
                }
            }
            
            logger.info("Successfully invalidated all active sessions for user: {}", userId);
            
        } catch (Exception e) {
            logger.error("Error invalidating all sessions for user: {}", userId, e);
            throw new RuntimeException("Failed to invalidate user sessions", e);
        }
    }
    
    @Override
    public UserSessionMapping findOrCreateAutoSession(String userId, String cohortId) {
        // First check if an active auto session exists
        List<UserSessionMapping> activeSessions = 
            userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(userId, cohortId);

        if (!activeSessions.isEmpty()) {
            return activeSessions.get(0); // reuse the first active one
        }

        // Otherwise create a new auto session
        UserSessionMapping session = new UserSessionMapping();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUuid(UUID.randomUUID().toString());
        session.setSessionStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        session.setSessionEndTimestamp(null);

        // Attach user & cohort refs
        User user = new User();
        user.setUserId(userId);
        session.setUser(user);

        Cohort cohort = new Cohort();
        cohort.setCohortId(cohortId);
        session.setCohort(cohort);

        return userSessionMappingRepository.save(session);
    }

}
