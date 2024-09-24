package com.FlowofEnglish.service;

import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserAttempts;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.UserAttemptsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserAttemptsServiceImpl implements UserAttemptsService {

    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserCohortMappingService userCohortMappingService; // Inject the service for updating leaderboard

    @Autowired
    private UserSubConceptService userSubConceptService; // Inject the service for UserSubConcept

    @Override
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsRepository.findAll();
    }

    @Override
    public Optional<UserAttempts> getUserAttemptById(int userAttemptId) {
        return userAttemptsRepository.findById(userAttemptId);
    }

//    @Override
//    public UserAttempts createUserAttempt(UserAttempts userAttempt) {
//        return userAttemptsRepository.save(userAttempt);
//    }
    @Override
    public UserAttempts createUserAttempt(UserAttempts userAttempt) {
    	// Save the user attempt first
        UserAttempts savedAttempt = userAttemptsRepository.save(userAttempt);
        
     // Update leaderboard after saving attempt
        updateLeaderboard(savedAttempt);
        
     // Update or create entry in UserSubConcept table
        updateUserSubConceptCompletionStatus(savedAttempt);
     
        return savedAttempt;
    }
    
 // Method to update or create entry in UserSubConcept table
    private void updateUserSubConceptCompletionStatus(UserAttempts userAttempt) {
        // Retrieve the details from the user attempt
        String userId = userAttempt.getUser().getUserId();
        String subconceptId = userAttempt.getSubconcept().getSubconceptId();
     
        // Check if the entry for the user and the subconcept already exists in the UserSubConcept table
        List<UserSubConcept> userSubConceptList = userSubConceptService.getAllUserSubConceptsByUserId(userId);

        // Check if the user has already attempted this subconcept
        boolean subconceptCompleted = userSubConceptList.stream()
            .anyMatch(subconcept -> subconcept.getSubconcept().getSubconceptId().equals(subconceptId));

        if (!subconceptCompleted) {
            // If the subconcept is not completed, create a new entry in UserSubConcept table
            UserSubConcept userSubConcept = new UserSubConcept();
            userSubConcept.setUser(userAttempt.getUser());
            userSubConcept.setProgram(userAttempt.getProgram());
            userSubConcept.setStage(userAttempt.getStage());
            userSubConcept.setUnit(userAttempt.getUnit());
            userSubConcept.setSubconcept(userAttempt.getSubconcept());
            userSubConcept.setCompletionStatus(true);  // Mark the subconcept as completed
            userSubConceptService.createUserSubConcept(userSubConcept);
        }
    }

 // Method to update the leaderboard score
    private void updateLeaderboard(UserAttempts userAttempt) {
        User user = userAttempt.getUser();
        int score = userAttempt.getUserAttemptScore();

        // Retrieve the user's cohort mapping
        Optional<UserCohortMapping> userCohortMappingOpt = userCohortMappingService.getUserCohortMappingByUserId(user.getUserId());
        
        if (userCohortMappingOpt.isPresent()) {
            // Update existing leaderboard score
            UserCohortMapping userCohortMapping = userCohortMappingOpt.get();
            int updatedScore = userCohortMapping.getLeaderboardScore() + score;
            userCohortMapping.setLeaderboardScore(updatedScore);
            userCohortMappingService.updateUserCohortMapping(user.getUserId(), userCohortMapping);
        } else {
            // Create new leaderboard entry if it doesn't exist
            UserCohortMapping newEntry = new UserCohortMapping();
            newEntry.setUser(user);
            newEntry.setLeaderboardScore(score);
            // Set other necessary fields, like cohort, if needed
            userCohortMappingService.createUserCohortMapping(newEntry);
        }
    }
    
    
    @Override
    public UserAttempts updateUserAttempt(int userAttemptId, UserAttempts userAttempt) {
        return userAttemptsRepository.findById(userAttemptId).map(existingAttempt -> {
            existingAttempt.setUserAttemptEndTimestamp(userAttempt.getUserAttemptEndTimestamp());
            existingAttempt.setUserAttemptFlag(userAttempt.isUserAttemptFlag());
            existingAttempt.setUserAttemptScore(userAttempt.getUserAttemptScore());
            existingAttempt.setUserAttemptStartTimestamp(userAttempt.getUserAttemptStartTimestamp());
            //existingAttempt.setConcept(userAttempt.getConcept());
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
    public void deleteUserAttempt(int userAttemptId) {
        userAttemptsRepository.deleteById(userAttemptId);
    }
}
