package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserAttempts;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAttemptsRepository extends JpaRepository<UserAttempts, Long> {

	List<UserAttempts> findByUser_UserIdAndProgram_ProgramId(String userId, String programId);
    List<UserAttempts> findByUser_UserIdAndSubconcept_SubconceptId(String userId, String subconceptId);
	
}
