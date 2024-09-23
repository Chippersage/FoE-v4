package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSubConcept;
import java.util.List;
//import java.util.Optional;

public interface UserSubConceptService {
   // Optional<UserSubConcept> findByUserIdAndUnitId(String userId, String unitId);
    
    UserSubConcept createUserSubConcept(UserSubConcept userSubConcept);
    UserSubConcept getUserSubConceptById(Long userSubconceptId);
    List<UserSubConcept> getAllUserSubConcepts();
    List<UserSubConcept> getAllUserSubConceptsByUserId(String userId);  // New method to get by userId
    UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept);
    //UserSubConcept updateUserSubConceptByUserId(String userId, UserSubConcept userSubConcept);  // New method to update by userId
    void deleteUserSubConcept(Long userSubconceptId);
    //void deleteUserSubConceptByUserId(String userId);  // New method to delete by userId
}
