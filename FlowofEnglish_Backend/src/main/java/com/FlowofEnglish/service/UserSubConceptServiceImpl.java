package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class UserSubConceptServiceImpl implements UserSubConceptService {

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private StageRepository stageRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private SubconceptRepository subconceptRepository;

    @Autowired
    private CacheManagementService cacheManagementService;
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserSubConceptServiceImpl.class);

    @Override
    @Cacheable(value = "userSubConcepts", key = "#userId + ':' + #programId + ':' + #stageId + ':' + #unitId + ':' + #subconceptId", unless = "#result == null")
    public Optional<UserSubConcept> findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
            String userId, String programId, String stageId, String unitId, String subconceptId) {
        logger.info("Finding UserSubConcept for userId: {}, programId: {}, stageId: {}, unitId: {}, subconceptId: {}", 
                userId, programId, stageId, unitId, subconceptId);
        return userSubConceptRepository
                .findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
                        userId, programId, stageId, unitId, subconceptId);
    }

    @Override
    @Transactional
    public UserSubConcept createUserSubConcept(UserSubConcept userSubConcept) {
        UserSubConcept saved = userSubConceptRepository.save(userSubConcept);
        
        // Evict caches when completion status changes
        String userId = userSubConcept.getUser().getUserId();
        String programId = userSubConcept.getProgram().getProgramId();
        cacheManagementService.evictUserCompletionCaches(userId, programId);
        
        return saved;
    }

    @Override
    @Transactional
    public UserSubConcept updateUserSubConcept(UserSubConcept userSubConcept) {
        UserSubConcept updated = userSubConceptRepository.save(userSubConcept);
        
        // Evict caches when completion status changes
        String userId = userSubConcept.getUser().getUserId();
        String programId = userSubConcept.getProgram().getProgramId();
        cacheManagementService.evictUserCompletionCaches(userId, programId);
        
        return updated;
    }

    @Override
    @Cacheable(value = "userSubConceptsById", key = "#userSubconceptId")
    public UserSubConcept getUserSubConceptById(Long userSubconceptId) {
        logger.info("Finding UserSubConcept by ID: {}", userSubconceptId);
        return userSubConceptRepository.findById(userSubconceptId).orElse(null);
    }

    @Override
    @Cacheable(value = "allUserSubConcepts", key = "'all'")
    public List<UserSubConcept> getAllUserSubConcepts() {
        logger.info("Retrieving all UserSubConcepts");
        return userSubConceptRepository.findAll();
    }

    @Override
    @Cacheable(value = "userSubConceptsByUser", key = "#userId")
    public List<UserSubConcept> getAllUserSubConceptsByUserId(String userId) {
        logger.info("Retrieving all UserSubConcepts for userId: {}", userId);
        return userSubConceptRepository.findAllByUser_UserId(userId);
    }

    @Override
    @Caching(
        put = @CachePut(value = "userSubConceptsById", key = "#userSubconceptId"),
        evict = {
            @CacheEvict(value = "userSubConceptsByUser", key = "#userSubConcept.user.userId"),
            @CacheEvict(value = "userSubConceptsByProgram", allEntries = true),
            @CacheEvict(value = "userSubConceptsByUnit", allEntries = true),
            @CacheEvict(value = "allUserSubConcepts", key = "'all'"),
            @CacheEvict(value = "userSubConcepts", allEntries = true),
            @CacheEvict(value = "completedSubconcepts", allEntries = true),
            @CacheEvict(value = "stageCompletionDates", allEntries = true)
        }
    )
    public UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept) {
        logger.info("Updating UserSubConcept with ID: {} using provided data", userSubconceptId);
        
        return userSubConceptRepository.findById(userSubconceptId).map(existingSubConcept -> {
            
            // Update fields
            existingSubConcept.setUser(userSubConcept.getUser());
            existingSubConcept.setProgram(userSubConcept.getProgram());
            existingSubConcept.setStage(userSubConcept.getStage());
            existingSubConcept.setUnit(userSubConcept.getUnit());
            existingSubConcept.setSubconcept(userSubConcept.getSubconcept());
            existingSubConcept.setCompletionStatus(userSubConcept.getCompletionStatus());
            
            // Only update UUID if provided and different
            if (userSubConcept.getUuid() != null && !userSubConcept.getUuid().isEmpty()) {
                existingSubConcept.setUuid(userSubConcept.getUuid());
            }
            
            UserSubConcept updatedConcept = userSubConceptRepository.save(existingSubConcept);
            logger.info("Successfully updated UserSubConcept with ID: {}", userSubconceptId);
            
            return updatedConcept;
        }).orElseThrow(() -> {
            logger.error("UserSubConcept not found with ID: {}", userSubconceptId);
            return new RuntimeException("UserSubConcept not found with ID: " + userSubconceptId);
        });
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "userSubConceptsById", key = "#userSubconceptId"),
        @CacheEvict(value = "userSubConceptsByUser", allEntries = true),
        @CacheEvict(value = "userSubConceptsByProgram", allEntries = true),
        @CacheEvict(value = "userSubConceptsByUnit", allEntries = true),
        @CacheEvict(value = "allUserSubConcepts", key = "'all'"),
        @CacheEvict(value = "userSubConcepts", allEntries = true),
        @CacheEvict(value = "completedSubconcepts", allEntries = true),
        @CacheEvict(value = "stageCompletionDates", allEntries = true)
    })
    public void deleteUserSubConcept(Long userSubconceptId) {
        logger.info("Deleting UserSubConcept with ID: {}", userSubconceptId);
        
        if (!userSubConceptRepository.existsById(userSubconceptId)) {
            logger.error("UserSubConcept not found with ID: {}", userSubconceptId);
            throw new RuntimeException("UserSubConcept not found with ID: " + userSubconceptId);
        }
        
        userSubConceptRepository.deleteById(userSubconceptId);
        logger.info("Successfully deleted UserSubConcept with ID: {}", userSubconceptId);
    }
}
//    // Additional cache-enabled methods for better performance
//
//    @Cacheable(value = "userSubConceptsByProgram", key = "#userId + ':' + #programId")
//    public List<UserSubConcept> getUserSubConceptsByUserIdAndProgramId(String userId, String programId) {
//        logger.info("Retrieving UserSubConcepts for userId: {} and programId: {}", userId, programId);
//        return userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
//    }
//
//    @Cacheable(value = "userSubConceptsByUnit", key = "#userId + ':' + #unitId")
//    public List<UserSubConcept> getUserSubConceptsByUserIdAndUnitId(String userId, String unitId) {
//        logger.info("Retrieving UserSubConcepts for userId: {} and unitId: {}", userId, unitId);
//        return userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unitId);
//    }
//
//    // Additional methods using custom queries from your repository
//    @Cacheable(value = "completedSubconcepts", key = "#userId")
//    public Set<String> getCompletedSubconceptIdsByUserId(String userId) {
//        logger.info("Retrieving completed subconcept IDs for userId: {}", userId);
//        return userSubConceptRepository.findCompletedSubconceptIdsByUser_UserId(userId);
//    }
//
//    @Cacheable(value = "stageCompletionDates", key = "#userId + ':' + #stageId + ':earliest'")
//    public Optional<OffsetDateTime> getEarliestCompletionDateByUserIdAndStageId(String userId, String stageId) {
//        logger.info("Retrieving earliest completion date for userId: {} and stageId: {}", userId, stageId);
//        return userSubConceptRepository.findEarliestCompletionDateByUserIdAndStageId(userId, stageId);
//    }
//
//    @Cacheable(value = "stageCompletionDates", key = "#userId + ':' + #stageId + ':latest'")
//    public Optional<OffsetDateTime> getLatestCompletionDateByUserIdAndStageId(String userId, String stageId) {
//        logger.info("Retrieving latest completion date for userId: {} and stageId: {}", userId, stageId);
//        return userSubConceptRepository.findLatestCompletionDateByUserIdAndStageId(userId, stageId);
//    }
//
//    @Cacheable(value = "stageCompletionDates", key = "#userId + ':' + #stageId + ':first'")
//    public Optional<OffsetDateTime> getFirstCompletionDateByUserIdAndStageId(String userId, String stageId) {
//        logger.info("Retrieving first completion date for userId: {} and stageId: {}", userId, stageId);
//        return userSubConceptRepository.findFirstCompletionDateByUserIdAndStageId(userId, stageId);
//    }
//
//    @Cacheable(value = "stageCompletionDates", key = "#userId + ':' + #stageId + ':ordered'")
//    public List<OffsetDateTime> getCompletionDatesByUserIdAndStageIdOrderByDateDesc(String userId, String stageId) {
//        logger.info("Retrieving ordered completion dates for userId: {} and stageId: {}", userId, stageId);
//        return userSubConceptRepository.findCompletionDatesByUserIdAndStageIdOrderByDateDesc(userId, stageId);
//    }
//
//    @CachePut(value = "userSubConcepts", key = "#userId + ':' + #programId + ':' + #stageId + ':' + #unitId + ':' + #subconceptId")
//    @CacheEvict(value = {"userSubConceptsByUser", "userSubConceptsByProgram"}, key = "#userId")
//    public UserSubConcept updateCompletionStatus(String userId, String programId, String stageId, 
//            String unitId, String subconceptId, boolean completionStatus) {
//        logger.info("Updating completion status to {} for userId: {}, subconceptId: {}", 
//                completionStatus, userId, subconceptId);
//        
//        Optional<UserSubConcept> conceptOpt = findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
//                userId, programId, stageId, unitId, subconceptId);
//        
//        if (conceptOpt.isEmpty()) {
//            logger.error("UserSubConcept not found for the given parameters");
//            throw new RuntimeException("UserSubConcept not found for the given parameters");
//        }
//        
//        UserSubConcept concept = conceptOpt.get();
//        concept.setCompletionStatus(completionStatus);
//        
//        UserSubConcept updatedConcept = userSubConceptRepository.save(concept);
//        logger.info("Successfully updated completion status for UserSubConcept ID: {}", updatedConcept.getUserSubconceptId());
//        
//        return updatedConcept;
//    }
//
//    // Helper methods for cached entity lookups
//    @Cacheable(value = "users", key = "#userId")
//    private User getCachedUser(String userId) {
//        return userRepository.findById(userId).orElse(null);
//    }
//
//    @Cacheable(value = "programs", key = "#programId")
//    private Program getCachedProgram(String programId) {
//        return programRepository.findById(programId).orElse(null);
//    }
//
//    @Cacheable(value = "stages", key = "#stageId")
//    private Stage getCachedStage(String stageId) {
//        return stageRepository.findById(stageId).orElse(null);
//    }
//
//    @Cacheable(value = "units", key = "#unitId")
//    private Unit getCachedUnit(String unitId) {
//        return unitRepository.findById(unitId).orElse(null);
//    }
//
//    @Cacheable(value = "subconcepts", key = "#subconceptId")
//    private Subconcept getCachedSubconcept(String subconceptId) {
//        return subconceptRepository.findById(subconceptId).orElse(null);
//    }
//
//    // Validation helper method
//    private void validateUserSubConceptEntities(UserSubConcept userSubConcept) {
//        if (userSubConcept.getUser() != null && userSubConcept.getUser().getUserId() != null) {
//            User user = getCachedUser(userSubConcept.getUser().getUserId());
//            if (user == null) {
//                throw new IllegalArgumentException("User not found with ID: " + userSubConcept.getUser().getUserId());
//            }
//        }
//
//        if (userSubConcept.getProgram() != null && userSubConcept.getProgram().getProgramId() != null) {
//            Program program = getCachedProgram(userSubConcept.getProgram().getProgramId());
//            if (program == null) {
//                throw new IllegalArgumentException("Program not found with ID: " + userSubConcept.getProgram().getProgramId());
//            }
//        }
//
//        if (userSubConcept.getStage() != null && userSubConcept.getStage().getStageId() != null) {
//            Stage stage = getCachedStage(userSubConcept.getStage().getStageId());
//            if (stage == null) {
//                throw new IllegalArgumentException("Stage not found with ID: " + userSubConcept.getStage().getStageId());
//            }
//        }
//
//        if (userSubConcept.getUnit() != null && userSubConcept.getUnit().getUnitId() != null) {
//            Unit unit = getCachedUnit(userSubConcept.getUnit().getUnitId());
//            if (unit == null) {
//                throw new IllegalArgumentException("Unit not found with ID: " + userSubConcept.getUnit().getUnitId());
//            }
//        }
//
//        if (userSubConcept.getSubconcept() != null && userSubConcept.getSubconcept().getSubconceptId() != null) {
//            Subconcept subconcept = getCachedSubconcept(userSubConcept.getSubconcept().getSubconceptId());
//            if (subconcept == null) {
//                throw new IllegalArgumentException("Subconcept not found with ID: " + userSubConcept.getSubconcept().getSubconceptId());
//            }
//        }
//    }
//}