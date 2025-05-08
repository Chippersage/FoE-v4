package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.UserAttemptsRepository;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    
 
    private static final Logger logger = LoggerFactory.getLogger(UserAttemptsServiceImpl.class);


    @Override
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsRepository.findAll();
    }

    @Override
    public Optional<UserAttempts> getUserAttemptById(Long userAttemptId) {
        return userAttemptsRepository.findById(userAttemptId);
    }
    
    @Transactional
    public UserAttempts saveUserAttempt(UserAttempts userAttempt) {
        try {
            return userAttemptsRepository.save(userAttempt);
        } catch (Exception e) {
            logger.error("Error saving user attempt: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save user attempt", e);
        }
    }
    
    @Override
    @Transactional
    public UserAttempts createUserAttempt(UserAttempts userAttempt, String cohortId) {
    	try {
    	// Save the user attempt first
        UserAttempts savedAttempt = userAttemptsRepository.save(userAttempt);
        logger.info("User attempt saved successfully for userId: {}, attemptId: {}",
                userAttempt.getUser().getUserId(), savedAttempt.getUserAttemptId());
        
        // Update leaderboard after saving attempt
        updateLeaderboard(savedAttempt, cohortId);
        
        // Update or create entry in UserSubConcept table
        updateUserSubConceptCompletionStatus(savedAttempt);
     
        return savedAttempt;
    } catch (Exception e) {
        logger.error("Error while creating user attempt for userId: {}, cohortId: {}, Error: {}",
                userAttempt.getUser().getUserId(), cohortId, e.getMessage(), e);
        throw new RuntimeException("Failed to create user attempt. Please try again later.");
    }
}
    
    private void updateUserSubConceptCompletionStatus(UserAttempts userAttempt) { 
    	try {
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
    	userSubConceptService.createUserSubConcept(userSubConcept);logger.info("New UserSubConcept entry created for userId: {}, subconceptId: {}", userId, subconceptId);
    	} else {
            // Entry already exists, update completion status if needed
            UserSubConcept userSubConcept = existingEntry.get();
            userSubConcept.setCompletionStatus(true); 
            userSubConceptService.updateUserSubConcept(userSubConcept);
            logger.info("Updated completion status for UserSubConcept, userId: {}, subconceptId: {}", userId, subconceptId);
        }
    }catch (Exception e) {
        logger.error("Error updating UserSubConcept for userId: {}, Error: {}", userAttempt.getUser().getUserId(), e.getMessage(), e);
        throw new RuntimeException("Failed to update UserSubConcept. Please contact support.");
    }
}

   // Revised updateLeaderboard method to handle multiple cohorts
    private void updateLeaderboard(UserAttempts userAttempt, String cohortId) {
    	try {
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
            logger.info("Updated leaderboard for userId: {}, cohortId: {}, newScore: {}", user.getUserId(), cohortId, updatedScore);
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
            logger.info("New leaderboard entry created for userId: {}, cohortId: {}, score: {}", user.getUserId(), cohortId, score);
        }
    } catch (Exception e) {
        logger.error("Error updating leaderboard for userId: {}, cohortId: {}, Error: {}", userAttempt.getUser().getUserId(), cohortId, e.getMessage(), e);
        throw new RuntimeException("Failed to update leaderboard. Please try again later.");
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