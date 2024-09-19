package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSubConcept;
import java.util.List;

public interface UserSubConceptService {
    UserSubConcept createUserSubConcept(UserSubConcept userSubConcept);
    UserSubConcept getUserSubConceptById(Long userSubconceptId);
    List<UserSubConcept> getAllUserSubConcepts();
    UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept);
    void deleteUserSubConcept(Long userSubconceptId);
}
