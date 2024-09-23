package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
//import java.util.Optional;

@Service
public class UserSubConceptServiceImpl implements UserSubConceptService {

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;

    @Override
    public UserSubConcept createUserSubConcept(UserSubConcept userSubConcept) {
        return userSubConceptRepository.save(userSubConcept);
    }
    
//    @Override
//    public Optional<UserSubConcept> findByUserIdAndUnitId(String userId, String unitId) {
//        return userSubConceptRepository.findByUser_UserIdAndUnitId(userId, unitId);
//       // Optional<UserSubConcept> findByUser_UserIdAndUnitId(String userId, String unitId);  // Traversing the relationship
//       // Optional<UserSubConcept> findByUser_UuidAndUnitId(String userUuid, String unitId);  // Similar for UUID
//
//    }

    @Override
    public UserSubConcept getUserSubConceptById(Long userSubconceptId) {
        return userSubConceptRepository.findById(userSubconceptId).orElse(null);
    }

    @Override
    public List<UserSubConcept> getAllUserSubConcepts() {
        return userSubConceptRepository.findAll();
    }

    @Override
    public List<UserSubConcept> getAllUserSubConceptsByUserId(String userId) {
        return userSubConceptRepository.findAllByUser_UserId(userId);  // New method implementation
    }

    @Override
    public UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept) {
        if (userSubConceptRepository.existsById(userSubconceptId)) {
            userSubConcept.setUserSubconceptId(userSubconceptId);
            return userSubConceptRepository.save(userSubConcept);
        }
        return null;
    }

//    @Override
//    public UserSubConcept updateUserSubConceptByUserId(String userId, UserSubConcept userSubConcept) {
//        List<UserSubConcept> existingSubConcepts = userSubConceptRepository.findAllByUserId(userId);
//        if (!existingSubConcepts.isEmpty()) {
//            UserSubConcept existing = existingSubConcepts.get(0); // Assuming you only update the first record
//            userSubConcept.setUserSubconceptId(existing.getUserSubconceptId());
//            return userSubConceptRepository.save(userSubConcept);
//        }
//        return null;
//    }

    @Override
    public void deleteUserSubConcept(Long userSubconceptId) {
        userSubConceptRepository.deleteById(userSubconceptId);
    }

//    @Override
//    public void deleteUserSubConceptByUserId(String userId) {
//        userSubConceptRepository.deleteByUserId(userId);  // New method implementation
//    }
}
