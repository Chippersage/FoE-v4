package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class UserSubConceptServiceImpl implements UserSubConceptService {

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;

    @Override
    public Optional<UserSubConcept> findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
            String userId, String programId, String stageId, String unitId, String subconceptId) {
        return userSubConceptRepository
                .findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(userId, programId, stageId, unitId, subconceptId);
    }
    
    @Override
    public UserSubConcept createUserSubConcept(UserSubConcept userSubConcept) {
        return userSubConceptRepository.save(userSubConcept);
    }
    
    @Override
    public UserSubConcept updateUserSubConcept(UserSubConcept userSubConcept) {
        return userSubConceptRepository.save(userSubConcept);
    }

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
        return userSubConceptRepository.findAllByUser_UserId(userId);
    }

    @Override
    public UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept) {
        return userSubConceptRepository.findById(userSubconceptId).map(existingSubConcept -> {
            existingSubConcept.setUser(userSubConcept.getUser());
            existingSubConcept.setProgram(userSubConcept.getProgram());
            existingSubConcept.setStage(userSubConcept.getStage());
            existingSubConcept.setUnit(userSubConcept.getUnit());
            existingSubConcept.setSubconcept(userSubConcept.getSubconcept());
            existingSubConcept.setCompletionStatus(userSubConcept.getCompletionStatus());
            existingSubConcept.setUuid(userSubConcept.getUuid());
            return userSubConceptRepository.save(existingSubConcept);
        }).orElseThrow(() -> new RuntimeException("UserSubConcept not found with ID: " + userSubconceptId));
    }
    
    @Override
    public void deleteUserSubConcept(Long userSubconceptId) {
        userSubConceptRepository.deleteById(userSubconceptId);
    }


}
