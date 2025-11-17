package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.dto.*;
import java.util.*;

public interface UserSessionMappingService {
	
    List<UserSessionMapping> getAllUserSessionMappings();
    Optional<UserSessionMapping> getUserSessionMappingById(String sessionId);
    List<UserSessionMapping> getUserSessionMappingsByUserId(String userId);
    
    Optional<UserSessionMapping> findBySessionId(String sessionId);
    List<UserSessionMapping> findActiveSessionsByUserIdAndCohortId(String userId, String cohortId);
    void invalidateSession(String sessionId);
    void invalidateAllActiveSessions(String userId, String cohortId);
    UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping);
    UserSessionMapping updateUserSessionMapping(String sessionId, UserSessionMapping userSessionMapping);
    void deleteUserSessionMapping(String sessionId);
    void invalidateAllUserSessions(String userId);
    List<UserSessionMapping> findActiveSessionsForCleanup();
    UserSessionMapping findOrCreateAutoSession(String userId, String cohortId);
    
    //Get latest 5 sessions for all users in a cohort with mentor validation
    CohortSessionsResponseDTO getLatestSessionsForCohortStructured(String mentorUserId, String cohortId);
    
    // Get latest 5 sessions for a specific user in a cohort with mentor validation
    CohortSessionsResponseDTO getLatestSessionsForUserStructured(String mentorUserId, String targetUserId, String cohortId);


}
