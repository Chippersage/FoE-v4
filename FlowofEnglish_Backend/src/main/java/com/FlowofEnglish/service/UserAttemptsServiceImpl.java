package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserAttempts;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.UserAttemptsRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserAttemptsServiceImpl implements UserAttemptsService {

    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserCohortMappingService userCohortMappingService; 
    
    @Autowired
    private UserSubConceptService userSubConceptService;

    @Override
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsRepository.findAll();
    }

    @Override
    public Optional<UserAttempts> getUserAttemptById(Long userAttemptId) {
        return userAttemptsRepository.findById(userAttemptId);
    }
    
    @Override
    public UserAttempts saveUserAttempt(UserAttempts userAttempt) {
        return userAttemptsRepository.save(userAttempt);
    }
   
    
    @Override
    @Transactional
    public UserAttempts createUserAttempt(UserAttempts userAttempt, String cohortId) {
        // Save the user attempt first
        UserAttempts savedAttempt = userAttemptsRepository.save(userAttempt);
        
        // Update leaderboard after saving attempt
        updateLeaderboard(savedAttempt, cohortId);
        
        // Update or create entry in UserSubConcept table
        updateUserSubConceptCompletionStatus(savedAttempt);
     
        return savedAttempt;
    }
    
    private void updateUserSubConceptCompletionStatus(UserAttempts userAttempt) { 
    	// Retrieve the details from the user attempt 
    	String userId = userAttempt.getUser().getUserId(); 
        String programId = userAttempt.getProgram().getProgramId();
        String stageId = userAttempt.getStage().getStageId();
        String unitId = userAttempt.getUnit().getUnitId();
        String subconceptId = userAttempt.getSubconcept().getSubconceptId();
        
     // Check if a UserSubConcept entry already exists for the unique constraint fields
        Optional<UserSubConcept> existingEntry = userSubConceptService
                .findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(userId, programId, stageId, unitId, subconceptId);

        if (existingEntry.isEmpty()) {
            // No entry exists, create a new one
    	UserSubConcept userSubConcept = new UserSubConcept(); 
    	userSubConcept.setUser(userAttempt.getUser()); 
    	userSubConcept.setProgram(userAttempt.getProgram()); 
    	userSubConcept.setStage(userAttempt.getStage()); 
    	userSubConcept.setUnit(userAttempt.getUnit()); 
    	userSubConcept.setSubconcept(userAttempt.getSubconcept()); 
    	userSubConcept.setCompletionStatus(true);
    	userSubConcept.setUuid(UUID.randomUUID().toString());
    	
    	userSubConceptService.createUserSubConcept(userSubConcept);
    	} else {
            // Entry already exists, update completion status if needed
            UserSubConcept userSubConcept = existingEntry.get();
            userSubConcept.setCompletionStatus(true); 
            userSubConceptService.updateUserSubConcept(userSubConcept);
        }
    }

   // Revised updateLeaderboard method to handle multiple cohorts
    private void updateLeaderboard(UserAttempts userAttempt, String cohortId) {
        User user = userAttempt.getUser();
        int score = userAttempt.getUserAttemptScore();

        // Retrieve the user's specific cohort mapping for the cohort tied to this attempt
        Optional<UserCohortMapping> userCohortMappingOpt = 
            userCohortMappingService.findByUser_UserIdAndCohort_CohortId(user.getUserId(), cohortId);

        if (userCohortMappingOpt.isPresent()) {
            // Update existing leaderboard score for the specified cohort
            UserCohortMapping userCohortMapping = userCohortMappingOpt.get();
            int updatedScore = userCohortMapping.getLeaderboardScore() + score;
            userCohortMapping.setLeaderboardScore(updatedScore);
            
            // Save the updated UserCohortMapping
            userCohortMappingService.updateUserCohortMapping(userCohortMapping. getUserCohortId(), userCohortMapping);
        } else {
            // If no mapping found, create a new leaderboard entry
            UserCohortMapping newEntry = new UserCohortMapping();
            Cohort cohort = new Cohort();
            cohort.setCohortId(cohortId); 
            newEntry.setCohort(cohort); 
            newEntry.setUser(user);
            newEntry.setLeaderboardScore(score);
            newEntry.setUuid(UUID.randomUUID().toString());
            
            // Save the new UserCohortMapping entry
            userCohortMappingService.createUserCohortMapping(newEntry);
        }
    }

    @Override
    public UserAttempts updateUserAttempt(Long userAttemptId, UserAttempts userAttempt) {
        return userAttemptsRepository.findById(userAttemptId).map(existingAttempt -> {
            existingAttempt.setUserAttemptEndTimestamp(userAttempt.getUserAttemptEndTimestamp());
            existingAttempt.setUserAttemptFlag(userAttempt.isUserAttemptFlag());
            existingAttempt.setUserAttemptScore(userAttempt.getUserAttemptScore());
            existingAttempt.setUserAttemptStartTimestamp(userAttempt.getUserAttemptStartTimestamp());
            existingAttempt.setUser(userAttempt.getUser());
            existingAttempt.setStage(userAttempt.getStage());
            existingAttempt.setUnit(userAttempt.getUnit());
            existingAttempt.setProgram(userAttempt.getProgram());
            existingAttempt.setSession(userAttempt.getSession());
            existingAttempt.setSubconcept(userAttempt.getSubconcept());
            existingAttempt.setUuid(userAttempt.getUuid());
            return userAttemptsRepository.save(existingAttempt);
        }).orElseThrow(() -> new RuntimeException("UserAttempt not found"));
    }

    @Override
    public void deleteUserAttempt(Long userAttemptId) {
        userAttemptsRepository.deleteById(userAttemptId);
    }
}
