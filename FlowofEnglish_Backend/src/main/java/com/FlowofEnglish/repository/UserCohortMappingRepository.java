package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserCohortMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCohortMappingRepository extends JpaRepository<UserCohortMapping, Integer> {
	
	List<UserCohortMapping> findAllByCohortCohortId(String cohortId);
	Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId);

    Optional<UserCohortMapping> findByUserUserId(String userId);

    List<UserCohortMapping> findAllByUserUserId(String userId);

    void deleteByUserUserId(String userId);
    
 // Add this method to your repository
    @Query("SELECT u FROM UserCohortMapping u WHERE u.user.userId = :userId AND u.cohort.cohortId IN " +
           "(SELECT cp.cohort.cohortId FROM CohortProgram cp WHERE cp.program.programId = :programId)")
    Optional<UserCohortMapping> findByUserUserIdAndProgramId(@Param("userId") String userId, @Param("programId") String programId);
}
