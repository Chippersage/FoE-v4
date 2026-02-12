package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserAttempts;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAttemptsRepository extends JpaRepository<UserAttempts, Long> {

	List<UserAttempts> findByUser_UserIdAndProgram_ProgramId(String userId, String programId);
    List<UserAttempts> findByUser_UserIdAndSubconcept_SubconceptId(String userId, String subconceptId);
    @Query("SELECT ua.user.userId, MAX(ua.userAttemptEndTimestamp) FROM UserAttempts ua " + "GROUP BY ua.user.userId")
     List<Object[]> findLatestAttemptTimestamps();

     @Query("SELECT ua FROM UserAttempts ua WHERE ua.user.userId = :userId ORDER BY ua.userAttemptEndTimestamp DESC")
     List<UserAttempts> findAttemptsByUserId(@Param("userId") String userId);
     
     @Query("SELECT ua.subconcept.subconceptId, MAX(ua.userAttemptScore) " +
             "FROM UserAttempts ua " + "WHERE ua.user.userId = :userId " + "GROUP BY ua.subconcept.subconceptId")
      List<Object[]> findMaxScoresByUser(@Param("userId") String userId);
      
     
 // Find UserAttempts by user, program, stage, unit, and subconcept This helps identify the specific attempt that corresponds to an assignment
      List<UserAttempts> findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
          String userId, String programId, String stageId,  String unitId,  String subconceptId );
      
    // Alternative method to find the most recent attempt for a specific user and subconcept Ordered by attempt end timestamp descending
      @Query("SELECT ua FROM UserAttempts ua WHERE ua.user.userId = :userId " + "AND ua.program.programId = :programId " +
             "AND ua.stage.stageId = :stageId " + "AND ua.unit.unitId = :unitId " + "AND ua.subconcept.subconceptId = :subconceptId " +
             "ORDER BY ua.userAttemptEndTimestamp DESC")
      List<UserAttempts> findLatestUserAttemptsByUserAndSubconcept(
          @Param("userId") String userId, @Param("programId") String programId,
          @Param("stageId") String stageId, @Param("unitId") String unitId,
          @Param("subconceptId") String subconceptId
      );
      
      /**
       * Find latest attempt timestamps for users who:
       * 1. Are ACTIVE (status = 'ACTIVE')
       * 2. Are in cohorts that haven't ended yet (cohortEndDate is null or > current time)
       * This eliminates the need for in-memory filtering
       */
      @Query("SELECT ua.user.userId, MAX(ua.userAttemptEndTimestamp) " +
             "FROM UserAttempts ua " +
             "JOIN ua.user u " +
             "JOIN UserCohortMapping ucm ON ucm.user.userId = u.userId " +
             "JOIN ucm.cohort c " +
             "WHERE u.status = 'ACTIVE' " +
             "AND ucm.status = 'ACTIVE' " +
             "AND (c.cohortEndDate IS NULL OR c.cohortEndDate > CURRENT_TIMESTAMP) " +
             "GROUP BY ua.user.userId")
      List<Object[]> findLatestAttemptTimestampsForActiveUsersInActiveCohorts();
  
      @Modifying
      @Transactional
      void deleteByUser_UserIdAndProgram_ProgramId(String userId, String programId);

          @Query("SELECT ua.user.userId, MAX(ua.userAttemptEndTimestamp) " +
	       "FROM UserAttempts ua " + "WHERE ua.user.userId IN :userIds " +
	       "AND ua.program.programId = :programId " +  "GROUP BY ua.user.userId")
	List<Object[]> findLatestAttemptDatesByUsersAndProgram( @Param("userIds") List<String> userIds,  @Param("programId") String programId );

	@Query("SELECT ua.user.userId, ua.subconcept.subconceptId, " +
	       "MAX(CASE WHEN LOWER(ua.subconcept.subconceptType) LIKE '%assignment%' THEN 1 ELSE 0 END) as isAssignment, " +
	       "MAX(ua.userAttemptScore) as maxScore " + "FROM UserAttempts ua " + "WHERE ua.user.userId IN :userIds " +
	       "AND ua.program.programId = :programId " + "AND ua.subconcept.subconceptId IN :subconceptIds " +
	       "GROUP BY ua.user.userId, ua.subconcept.subconceptId")
	List<Object[]> findAssignmentAttemptsByUsersAndProgram( @Param("userIds") List<String> userIds,
	    @Param("programId") String programId, @Param("subconceptIds") List<String> subconceptIds );
	
}
