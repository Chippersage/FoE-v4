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
     
     @Query("SELECT ua.subconcept.subconceptId, MAX(ua.userAttemptScore) " +
             "FROM UserAttempts ua " +
             "WHERE ua.user.userId = :userId " +
             "GROUP BY ua.subconcept.subconceptId")
      List<Object[]> findMaxScoresByUser(@Param("userId") String userId);
      
      /**
       * Find UserAttempts by user, program, stage, unit, and subconcept
       * This helps identify the specific attempt that corresponds to an assignment
       */
      List<UserAttempts> findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
          String userId, 
          String programId, 
          String stageId, 
          String unitId, 
          String subconceptId
      );
      
      /**
       * Alternative method to find the most recent attempt for a specific user and subconcept
       * Ordered by attempt end timestamp descending
       */
      @Query("SELECT ua FROM UserAttempts ua WHERE ua.user.userId = :userId " +
             "AND ua.program.programId = :programId " +
             "AND ua.stage.stageId = :stageId " +
             "AND ua.unit.unitId = :unitId " +
             "AND ua.subconcept.subconceptId = :subconceptId " +
             "ORDER BY ua.userAttemptEndTimestamp DESC")
      List<UserAttempts> findLatestUserAttemptsByUserAndSubconcept(
          @Param("userId") String userId,
          @Param("programId") String programId,
          @Param("stageId") String stageId,
          @Param("unitId") String unitId,
          @Param("subconceptId") String subconceptId
      );
}
