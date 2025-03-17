package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserSessionMapping;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSessionMappingRepository extends JpaRepository<UserSessionMapping, String> {
	Optional<UserSessionMapping> findBySessionId(String sessionId);
	List<UserSessionMapping> findByUser_UserId(String userId);
	List<UserSessionMapping> findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(
		    String userId, String cohortId);
//	Optional<UserSessionMapping> findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(
//		    String userId, String cohortId);
	@Query("SELECT us FROM UserSessionMapping us WHERE us.user.userId = :userId AND us.cohort.cohortId = :cohortId AND us.sessionEndTimestamp IS NULL")
	Optional<UserSessionMapping> findActiveSession(@Param("userId") String userId, @Param("cohortId") String cohortId);

	@Query("SELECT u FROM User u JOIN u.userSessions us WHERE us.sessionStartTimestamp < :timestamp")
	List<User> findInactiveUsersSince(@Param("timestamp") OffsetDateTime timestamp);

    // Custom query methods can be added here if necessary
}
