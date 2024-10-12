package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSubConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSubConceptRepository extends JpaRepository<UserSubConcept, Long> {
 	List<UserSubConcept> findByUser_UserIdAndUnit_UnitId(String userId, String unitId);
	List<UserSubConcept> findAllByUser_UserId(String userId);  // Updated method to find by userId
	List<UserSubConcept> findByUser_UserIdAndProgram_ProgramId(String userId, String programId);
	
	// List<UserSubConcept> findByUnit_UnitId(String unitId);

}

