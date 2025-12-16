package com.FlowofEnglish.service;

import com.FlowofEnglish.exception.ResourceNotFoundException;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.*;
import java.time.*;
import java.util.*;

@Service
public class UserAttemptsServiceImpl implements UserAttemptsService {

    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserCohortMappingService userCohortMappingService;
    
    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;
    
    @Autowired
    private UserSubConceptService userSubConceptService;
    
    @Autowired
    private CacheManagementService cacheManagementService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private UnitService unitService;

    @Autowired
    private ProgramService programService;

    @Autowired
    private StageService stageService;

    @Autowired
    private UserSessionMappingService userSessionMappingService;

    @Autowired
    private SubconceptService subconceptService;

    private static final Logger logger = LoggerFactory.getLogger(UserAttemptsServiceImpl.class);


    @Override
    @Cacheable(value = "userAttempts", key = "'all'")
    public List<UserAttempts> getAllUserAttempts() {
        try {
            logger.info("Retrieving all user attempts from database");
            List<UserAttempts> userAttempts = userAttemptsRepository.findAll();
            logger.info("Successfully retrieved {} user attempts", userAttempts.size());
            return userAttempts;
        } catch (Exception e) {
            logger.error("Error occurred while retrieving all user attempts: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve user attempts", e);
        }
    }

    @Override
    @Cacheable(value = "userAttempts", key = "#userAttemptId")
    public Optional<UserAttempts> getUserAttemptById(Long userAttemptId) {
        try {
            logger.info("Retrieving user attempt with ID: {}", userAttemptId);
            
            if (userAttemptId == null) {
                logger.warn("User attempt ID is null");
                throw new IllegalArgumentException("User attempt ID cannot be null");
            }
            
            Optional<UserAttempts> userAttempt = userAttemptsRepository.findById(userAttemptId);
            
            if (userAttempt.isPresent()) {
                logger.info("Successfully found user attempt with ID: {}", userAttemptId);
            } else {
                logger.warn("No user attempt found with ID: {}", userAttemptId);
            }
            
            return userAttempt;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for getUserAttemptById: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while retrieving user attempt with ID {}: {}", userAttemptId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve user attempt", e);
        }
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "userAttempts", allEntries = true)
    public UserAttempts saveUserAttempt(UserAttempts userAttempt) {
        try {
            logger.info("Saving user attempt for user ID: {}", 
                    userAttempt != null && userAttempt.getUser() != null ? userAttempt.getUser().getUserId() : "null");
            
            if (userAttempt == null) {
                logger.error("User attempt object is null");
                throw new IllegalArgumentException("User attempt cannot be null");
            }
            
            if (userAttempt.getUser() == null) {
                logger.error("User is null in user attempt");
                throw new IllegalArgumentException("User cannot be null in user attempt");
            }
            
            UserAttempts savedAttempt = userAttemptsRepository.save(userAttempt);
            logger.info("Successfully saved user attempt with ID: {} for user: {}", 
                    savedAttempt.getUserAttemptId(), userAttempt.getUser().getUserId());
            
            return savedAttempt;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for saveUserAttempt: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error saving user attempt for user: {}: {}", 
                        userAttempt != null && userAttempt.getUser() != null ? userAttempt.getUser().getUserId() : "null", 
                        e.getMessage(), e);
            throw new RuntimeException("Failed to save user attempt", e);
        }
    }
    
    @Override
    @Transactional(timeout = 30) // 30 seconds timeout
    public UserAttempts createUserAttempt(UserAttempts userAttempt, String cohortId) {
        try {
            logger.info("Creating user attempt for user ID: {} in cohort: {}",
                        userAttempt != null && userAttempt.getUser() != null ? userAttempt.getUser().getUserId() : "null",
                        cohortId);
            
            if (userAttempt == null) {
                logger.error("User attempt object is null");
                throw new IllegalArgumentException("User attempt cannot be null");
            }
            
            if (cohortId == null || cohortId.trim().isEmpty()) {
                logger.error("Cohort ID is null or empty");
                throw new IllegalArgumentException("Cohort ID cannot be null or empty");
            }
            
            if (userAttempt.getUser() == null) {
                logger.error("User is null in user attempt");
                throw new IllegalArgumentException("User cannot be null in user attempt");
            }
            
    	// Save the user attempt first
        UserAttempts savedAttempt = userAttemptsRepository.save(userAttempt);
        logger.info("User attempt saved successfully for userId: {}, attemptId: {}",
                userAttempt.getUser().getUserId(), savedAttempt.getUserAttemptId());
        
        // Update leaderboard after saving attempt
        updateLeaderboard(savedAttempt, cohortId);
        
        // Update or create entry in UserSubConcept table
        updateUserSubConceptCompletionStatus(savedAttempt);
        
     // IMPORTANT: Enhanced cache eviction after completion status changes
        String userId = savedAttempt.getUser().getUserId();
        String programId = savedAttempt.getProgram().getProgramId();
        String stageId = savedAttempt.getStage().getStageId();
        String unitId = savedAttempt.getUnit().getUnitId();
        String subconceptId = savedAttempt.getSubconcept().getSubconceptId();
        
        logger.info("Evicting caches for userId: {}, subconceptId: {}, programId: {}", 
                userId, subconceptId, programId);
        

     // 1. FIRST: Evict the specific userAttempts cache (this should fix the immediate issue)
        cacheManagementService.evictSpecificUserAttemptsCache(userId, subconceptId);

        // 2. SECOND: Evict program report with proper user type key (CRITICAL FIX)
        cacheManagementService.evictProgramReportWithUserType(userId, programId);

        // 3. Evict unit-level caches
        cacheManagementService.evictUnitReportCaches(userId, unitId, stageId, programId);

        // 4. Evict program and stage level caches
        cacheManagementService.evictProgramAndStageCaches(userId, programId, stageId);

        // 5. Evict user progress caches
        cacheManagementService.evictUserProgressCaches(userId, programId);

        // 6. NUCLEAR OPTION: If still having issues, evict all user caches
        // cacheManagementService.evictAllUserCaches(userId);
        
        logger.info("Successfully created user attempt with ID: {} for user: {} in cohort: {} and evicted related caches", 
                savedAttempt.getUserAttemptId(), userAttempt.getUser().getUserId(), cohortId);
    
    return savedAttempt;
    } catch (IllegalArgumentException e) {
        logger.error("Invalid argument for createUserAttempt: {}", e.getMessage());
        throw e;
    } catch (Exception e) {
        logger.error("Error while creating user attempt for userId: {}, cohortId: {}, Error: {}",
                userAttempt != null && userAttempt.getUser() != null ? userAttempt.getUser().getUserId() : "null", 
                cohortId, e.getMessage(), e);
        throw new RuntimeException("Failed to create user attempt. Please try again later.", e);
    }
    }
    
    private void updateUserSubConceptCompletionStatus(UserAttempts userAttempt) { 
    	try {
    		logger.debug("Updating UserSubConcept completion status for user: {}", 
                    userAttempt.getUser().getUserId());
    		
    	// Retrieve the details from the user attempt 
    	String userId = userAttempt.getUser().getUserId(); 
        String programId = userAttempt.getProgram().getProgramId();
        String stageId = userAttempt.getStage().getStageId();
        String unitId = userAttempt.getUnit().getUnitId();
        String subconceptId = userAttempt.getSubconcept().getSubconceptId();
        
        logger.debug("Processing UserSubConcept for userId: {}, programId: {}, stageId: {}, unitId: {}, subconceptId: {}", 
                userId, programId, stageId, unitId, subconceptId);
        
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
    	logger.info("New UserSubConcept entry created for userId: {}, subconceptId: {}", userId, subconceptId);
        } else {
            // Entry already exists, update completion status if needed
            UserSubConcept userSubConcept = existingEntry.get();
            if (!userSubConcept.isCompletionStatus()) {
                userSubConcept.setCompletionStatus(true); 
                userSubConceptService.updateUserSubConcept(userSubConcept);
                logger.info("Updated completion status for UserSubConcept, userId: {}, subconceptId: {}", userId, subconceptId);
            } else {
                logger.debug("UserSubConcept already marked as complete for userId: {}, subconceptId: {}", userId, subconceptId);
            }
        }
    } catch (Exception e) {
        logger.error("Error updating UserSubConcept for userId: {}, Error: {}", 
                    userAttempt.getUser().getUserId(), e.getMessage(), e);
        throw new RuntimeException("Failed to update UserSubConcept. Please contact support.", e);
    }
}

   // Revised updateLeaderboard method to handle multiple cohorts
    private void updateLeaderboard(UserAttempts userAttempt, String cohortId) {
    	try {
    		logger.debug("Updating leaderboard for user: {} in cohort: {}", 
                    userAttempt.getUser().getUserId(), cohortId);
    		
        User user = userAttempt.getUser();
        int score = userAttempt.getUserAttemptScore();

        logger.debug("User attempt score: {} for user: {}", score, user.getUserId());
        
        // Retrieve the user's specific cohort mapping for the cohort tied to this attempt
        Optional<UserCohortMapping> userCohortMappingOpt = 
            userCohortMappingService.findByUser_UserIdAndCohort_CohortId(user.getUserId(), cohortId);

        if (userCohortMappingOpt.isPresent()) {
            // Update existing leaderboard score for the specified cohort
            UserCohortMapping userCohortMapping = userCohortMappingOpt.get();
            int previousScore = userCohortMapping.getLeaderboardScore();
            int updatedScore = previousScore + score;
            userCohortMapping.setLeaderboardScore(updatedScore);
            
            
         // Save the updated UserCohortMapping
            userCohortMappingService.updateUserCohortMapping(userCohortMapping.getUserCohortId(), userCohortMapping);
            logger.info("Updated leaderboard for userId: {}, cohortId: {}, previousScore: {}, newScore: {}", 
            		user.getUserId(), cohortId, previousScore, updatedScore);
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

    @Transactional(timeout = 30)
    public UserAttempts autoCompleteSubconcept(String userId, String programId, 
                                               String stageId, String unitId, 
                                               String subconceptId, String cohortId) {
        // 1. Fetch required entities
        User user = userService.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Program program = programService.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        Stage stage = stageService.findByStageId(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));
        Unit unit = unitService.findByUnitId(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
        Subconcept subconcept = subconceptService.findBySubconceptId(subconceptId)
                .orElseThrow(() -> new ResourceNotFoundException("Subconcept not found"));

        // 2. Create synthetic session if required
        UserSessionMapping session = userSessionMappingService
                .findOrCreateAutoSession(userId, cohortId);

        // 3. Create UserAttempt
        UserAttempts attempt = new UserAttempts();
        attempt.setUser(user);
        attempt.setProgram(program);
        attempt.setStage(stage);
        attempt.setUnit(unit);
        attempt.setSession(session);
        attempt.setSubconcept(subconcept);
        attempt.setUserAttemptStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        attempt.setUserAttemptEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        attempt.setUserAttemptFlag(true);
        attempt.setUserAttemptScore(subconcept.getSubconceptMaxscore()); // full score if auto-complete

        UserAttempts savedAttempt = userAttemptsRepository.save(attempt);

        // 4. Update leaderboard
        updateLeaderboard(savedAttempt, cohortId);

        // 5. Update UserSubConcept table
        updateUserSubConceptCompletionStatus(savedAttempt);

        // 6. Evict caches
        cacheManagementService.evictUserCompletionCaches(userId, programId);
        cacheManagementService.evictUnitReportCaches(userId, unitId, stageId, programId);

        return savedAttempt;
    }
    
    @Override
    @Transactional(timeout = 900)
    public List<UserAttempts> autoCompleteProgram(String userId, String programId, String cohortId) {
        User user = userService.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Program program = programService.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));

        // Create or reuse session
        UserSessionMapping session = userSessionMappingService.findOrCreateAutoSession(userId, cohortId);

        // ✅ Fetch mappings instead of subconcepts directly
        List<ProgramConceptsMapping> mappings =
                programConceptsMappingRepository.findAllByProgram_ProgramId(programId);

        List<UserAttempts> attempts = new ArrayList<>();

        for (ProgramConceptsMapping mapping : mappings) {
            Subconcept subconcept = mapping.getSubconcept();
            Unit unit = mapping.getUnit();
            Stage stage = mapping.getStage();

            UserAttempts attempt = new UserAttempts();
            attempt.setUser(user);
            attempt.setProgram(program);
            attempt.setStage(stage);
            attempt.setUnit(unit);
            attempt.setSession(session);
            attempt.setSubconcept(subconcept);
            attempt.setUserAttemptStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            attempt.setUserAttemptEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            attempt.setUserAttemptFlag(true);
            attempt.setUserAttemptScore(subconcept.getSubconceptMaxscore());

            UserAttempts savedAttempt = userAttemptsRepository.save(attempt);

            updateLeaderboard(savedAttempt, cohortId);
            updateUserSubConceptCompletionStatus(savedAttempt);

            cacheManagementService.evictUserCompletionCaches(userId, programId);
            cacheManagementService.evictUnitReportCaches(userId, unit.getUnitId(), stage.getStageId(), programId);

            attempts.add(savedAttempt);
        }

        logger.info("Auto-completed {} subconcepts for user {} in program {}", 
                     attempts.size(), userId, programId);

        return attempts;
    }


    @Override
    @CachePut(value = "userAttempts", key = "#userAttemptId")
    @CacheEvict(value = "userAttempts", key = "'all'")
    public UserAttempts updateUserAttempt(Long userAttemptId, UserAttempts userAttempt) {
        try {
            logger.info("Updating user attempt with ID: {}", userAttemptId);
            
            if (userAttemptId == null) {
                logger.error("User attempt ID is null for update");
                throw new IllegalArgumentException("User attempt ID cannot be null");
            }
            
            if (userAttempt == null) {
                logger.error("Updated user attempt object is null");
                throw new IllegalArgumentException("Updated user attempt cannot be null");
            }
            
            return userAttemptsRepository.findById(userAttemptId)
                    .map(existingAttempt -> {
                        logger.debug("Found existing user attempt with ID: {}, updating fields", userAttemptId);
                        
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
                        
                        UserAttempts savedAttempt = userAttemptsRepository.save(existingAttempt);
                        logger.info("Successfully updated user attempt with ID: {}", userAttemptId);
                        return savedAttempt;
                    })
                    .orElseThrow(() -> {
                        logger.error("User attempt not found with ID: {} for update", userAttemptId);
                        return new IllegalArgumentException("UserAttempt not found with ID: " + userAttemptId);
                    });
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for updateUserAttempt: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while updating user attempt with ID {}: {}", userAttemptId, e.getMessage(), e);
            throw new RuntimeException("Failed to update user attempt", e);
        }
    }
    
    @Override
    @CacheEvict(value = "userAttempts", allEntries = true)
    public void deleteUserAttempt(Long userAttemptId) {
        try {
            logger.info("Deleting user attempt with ID: {}", userAttemptId);
            
            if (userAttemptId == null) {
                logger.error("User attempt ID is null for deletion");
                throw new IllegalArgumentException("User attempt ID cannot be null");
            }
            
            if (!userAttemptsRepository.existsById(userAttemptId)) {
                logger.warn("User attempt not found with ID: {} for deletion", userAttemptId);
                throw new IllegalArgumentException("User attempt not found with ID: " + userAttemptId);
            }
            
            userAttemptsRepository.deleteById(userAttemptId);
            logger.info("Successfully deleted user attempt with ID: {}", userAttemptId);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for deleteUserAttempt: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while deleting user attempt with ID {}: {}", userAttemptId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete user attempt", e);
        }
    }
    
    @Override
    @Transactional
    @CacheEvict(
        value = {
            "userAttempts",
            "userSubConcepts",
            "userSubConceptsByUser",
            "completedSubconcepts",
            "userProgress",
            "programReports",
            "cohortLeaderboards"
        },
        allEntries = true
    )
    public void deleteUserProgressByUserAndProgram(String userId, String programId) {

        logger.warn("Deleting ALL progress for userId={} in programId={}", userId, programId);

        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (programId == null || programId.trim().isEmpty()) {
            throw new IllegalArgumentException("Program ID cannot be null or empty");
        }

        // 1 Delete UserAttempts FIRST (attempts drive scores)
        userAttemptsRepository
                .deleteByUser_UserIdAndProgram_ProgramId(userId, programId);

        // 2️ Delete UserSubConcept completions
        userSubConceptService
                .deleteUserSubConceptsByUserAndProgram(userId, programId);

        logger.warn("Successfully deleted progress for userId={} programId={}", userId, programId);
    }

}