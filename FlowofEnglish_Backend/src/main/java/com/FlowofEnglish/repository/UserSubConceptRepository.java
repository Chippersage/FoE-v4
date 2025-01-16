package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSubConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubConceptRepository extends JpaRepository<UserSubConcept, Long> {
 	List<UserSubConcept> findByUser_UserIdAndUnit_UnitId(String userId, String unitId);
	List<UserSubConcept> findAllByUser_UserId(String userId);  
	List<UserSubConcept> findByUser_UserIdAndProgram_ProgramId(String userId, String programId);
	
	Optional<UserSubConcept> findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
		    String userId, String programId, String stageId, String unitId, String subconceptId);
	
	@Query("SELECT MIN(usc.completionDate) " +
		       "FROM UserSubConcept usc " +
		       "WHERE usc.user.userId = :userId AND usc.stage.stageId = :stageId")
		Optional<OffsetDateTime> findEarliestCompletionDateByUserIdAndStageId(@Param("userId") String userId,
		                                                                     @Param("stageId") String stageId);


}

