package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSubConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
//import java.util.Optional;

@Repository
public interface UserSubConceptRepository extends JpaRepository<UserSubConcept, Long> {
 // Optional<UserSubConcept> findByUserIdAndUnitId(String userId, String unitId);
//    Optional<UserSubConcept> findByUserUuidAndUnitId(String userUuid, String unitId);
//    Optional<UserSubConcept> findByUser_UserIdAndUnitId(String userId, String unitId);  // Traversing the relationship
//    Optional<UserSubConcept> findByUser_UuidAndUnitId(String userUuid, String unitId);  // Similar for UUID
	List<UserSubConcept> findAllByUser_UserId(String userId);  // Updated method to find by userId
 //  List<UserSubConcept> findAllByUserId(String userId);  // New method to find all by userId
//    void deleteByUserId(String userId);  // New method to delete by userId
}

