package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserAttempts;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAttemptsRepository extends JpaRepository<UserAttempts, Long> {

	List<UserAttempts> findByUser_UserIdAndProgram_ProgramId(String userId, String programId);
    List<UserAttempts> findByUser_UserIdAndSubconcept_SubconceptId(String userId, String subconceptId);
    @Query("SELECT ua.user.userId, MAX(ua.userAttemptEndTimestamp) FROM UserAttempts ua " +
            "GROUP BY ua.user.userId")
     List<Object[]> findLatestAttemptTimestamps();

     @Query("SELECT ua FROM UserAttempts ua WHERE ua.user.userId = :userId ORDER BY ua.userAttemptEndTimestamp DESC")
     List<UserAttempts> findAttemptsByUserId(@Param("userId") String userId);
}
