package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSubConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
//import java.util.Optional;

@Repository
public interface UserSubConceptRepository extends JpaRepository<UserSubConcept, Long> {
 	Optional<UserSubConcept> findByUser_UserIdAndUnit_UnitId(String userId, String unitId);
	List<UserSubConcept> findAllByUser_UserId(String userId);  // Updated method to find by userId
	long countByUser_UserIdAndUnit_UnitIdAndCompletionStatus(String userId, String unitId, String completionStatus);

}

