package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.*;
import jakarta.transaction.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSessionMappingRepository extends JpaRepository<UserSessionMapping, String> {
	Optional<UserSessionMapping> findBySessionId(String sessionId);
	List<UserSessionMapping> findByUser_UserId(String userId);
	List<UserSessionMapping> findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(
		    String userId, String cohortId);

	@Query("SELECT us FROM UserSessionMapping us WHERE us.user.userId = :userId AND us.cohort.cohortId = :cohortId AND us.sessionEndTimestamp IS NULL")
	Optional<UserSessionMapping> findActiveSession(@Param("userId") String userId, @Param("cohortId") String cohortId);

	@Query("SELECT u FROM User u JOIN u.userSessions us WHERE us.sessionStartTimestamp < :timestamp")
	List<User> findInactiveUsersSince(@Param("timestamp") OffsetDateTime timestamp);
    
     // Find all active sessions for a user across all devices and cohorts 
    @Query("SELECT us FROM UserSessionMapping us WHERE us.user.userId = :userId AND us.sessionEndTimestamp IS NULL")
    List<UserSessionMapping> findAllActiveSessionsForUser(@Param("userId") String userId);
    
    //  Find all active sessions for a user in a specific cohort
    @Query("SELECT us FROM UserSessionMapping us WHERE us.user.userId = :userId AND us.cohort.cohortId = :cohortId AND us.sessionEndTimestamp IS NULL")
    List<UserSessionMapping> findAllActiveSessionsForUserInCohort(@Param("userId") String userId, @Param("cohortId") String cohortId);
    
     // Terminate all active sessions for a user except the current one
    @Modifying
    @Transactional
    @Query("UPDATE UserSessionMapping us SET us.sessionEndTimestamp = :endTime WHERE us.user.userId = :userId AND us.sessionEndTimestamp IS NULL AND us.sessionId != :currentSessionId")
    int terminateAllOtherActiveSessions(@Param("userId") String userId, 
                                       @Param("currentSessionId") String currentSessionId, 
                                       @Param("endTime") OffsetDateTime endTime);
    
     // Terminate all active sessions for a user in a specific cohort except the current one
    @Modifying
    @Transactional
    @Query("UPDATE UserSessionMapping us SET us.sessionEndTimestamp = :endTime WHERE us.user.userId = :userId AND us.cohort.cohortId = :cohortId AND us.sessionEndTimestamp IS NULL AND us.sessionId != :currentSessionId")
    int terminateAllOtherActiveSessionsInCohort(@Param("userId") String userId, 
                                               @Param("cohortId") String cohortId,
                                               @Param("currentSessionId") String currentSessionId, 
                                               @Param("endTime") OffsetDateTime endTime);
    
     // Count active sessions for a user
    @Query("SELECT COUNT(us) FROM UserSessionMapping us WHERE us.user.userId = :userId AND us.sessionEndTimestamp IS NULL")
    long countActiveSessionsForUser(@Param("userId") String userId);
    
    @Query("SELECT usm FROM UserSessionMapping usm WHERE usm.sessionEndTimestamp IS NULL")
    List<UserSessionMapping> findBySessionEndTimestampIsNull();
    
    
     // Find latest session for each user in a specific cohort Returns the most recent session (by sessionEndTimestamp) for each user in the cohort
    @Query("SELECT usm FROM UserSessionMapping usm " +
           "WHERE usm.cohort.cohortId = :cohortId " +
           "AND usm.sessionId IN (" +
           "   SELECT usm2.sessionId FROM UserSessionMapping usm2 " +
           "   WHERE usm2.user.userId = usm.user.userId " +
           "   AND usm2.cohort.cohortId = :cohortId " +
           "   AND usm2.sessionEndTimestamp IS NOT NULL " +
           "   ORDER BY usm2.sessionEndTimestamp DESC " +
           ")")
    List<UserSessionMapping> findLatestSessionsByCohortId(@Param("cohortId") String cohortId);
    
    
     // Find latest session for a specific user in a specific cohort
    @Query("SELECT usm FROM UserSessionMapping usm " +
           "WHERE usm.user.userId = :userId " +
           "AND usm.cohort.cohortId = :cohortId " +
           "AND usm.sessionEndTimestamp IS NOT NULL " +
           "ORDER BY usm.sessionEndTimestamp DESC " +
           "LIMIT 1")
    List<UserSessionMapping> findLatestSessionByUserIdAndCohortId(@Param("userId") String userId, 
                                                                 @Param("cohortId") String cohortId);
    
    // Find the latest 5 sessions for a specific user in a specific cohort Ordered by sessionEndTimestamp descending (most recent first)
    @Query("SELECT usm FROM UserSessionMapping usm " +
    	       "WHERE usm.user.userId = :userId " +
    	       "AND usm.cohort.cohortId = :cohortId " +
    	       "AND usm.sessionEndTimestamp IS NOT NULL " +
    	       "ORDER BY usm.sessionEndTimestamp DESC")
    	List<UserSessionMapping> findTop5SessionsByUserIdAndCohortId(@Param("userId") String userId, 
    	                                                               @Param("cohortId") String cohortId,
    	                                                               Pageable pageable);
    // Find all users enrolled in a cohort with their latest session Returns one record per user (the most recent session)
    @Query("SELECT usm FROM UserSessionMapping usm " +
    	       "WHERE usm.cohort.cohortId = :cohortId " +
    	       "AND usm.sessionEndTimestamp = (" +
    	       "   SELECT MAX(usm2.sessionEndTimestamp) " +
    	       "   FROM UserSessionMapping usm2 " +
    	       "   WHERE usm2.user.userId = usm.user.userId " +
    	       "   AND usm2.cohort.cohortId = :cohortId " +
    	       "   AND usm2.sessionEndTimestamp IS NOT NULL" +
    	       ")")
    	List<UserSessionMapping> findLatestSessionPerUserInCohort(@Param("cohortId") String cohortId);
 
    // Alternative approach: Get all users in cohort from UserCohortMapping This ensures we get ALL users, even those without any session history
    @Query("SELECT ucm.user FROM UserCohortMapping ucm WHERE ucm.cohort.cohortId = :cohortId")
    List<User> findAllUsersInCohort(@Param("cohortId") String cohortId);
}
