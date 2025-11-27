package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;


@RestController
@RequestMapping("/api/v1/user-cohort-mappings")
public class UserCohortMappingController {

    @Autowired
    private UserCohortMappingService userCohortMappingService;
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserCohortMappingController.class);

    // GET all mappings
    @GetMapping
    public List<UserCohortMappingDTO> getAllUserCohortMappings() {
        return userCohortMappingService.getAllUserCohortMappings();
    }
    
 // GET user cohort mappings by cohortId
    @GetMapping("/cohort/{cohortId}")
    public ResponseEntity<LeaderboardResponseDTO> getUserCohortMappingsByCohortId(@PathVariable String cohortId) {
        try {
            LeaderboardResponseDTO response = userCohortMappingService.getUserCohortMappingsByCohortId(cohortId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                .body(LeaderboardResponseDTO.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                .body(LeaderboardResponseDTO.error("An unexpected error occurred."));
        }
    }

    @GetMapping("/cohort/{cohortId}/learner")
    public List<UserCohortMappingDTO> getUserCohortMappingsCohortId(@PathVariable String cohortId) {
        return userCohortMappingService.getUserCohortMappingsCohortId(cohortId);
    }
    
    @GetMapping("/cohort/{cohortId}/leaderboard")
    public ResponseEntity<LeaderboardResponseDTO> getCohortLeaderboard(@PathVariable String cohortId) {
        try {
            LeaderboardResponseDTO leaderboardData = 
                userCohortMappingService.getUserCohortMappingsWithLeaderboard(cohortId);
            return ResponseEntity.ok(leaderboardData);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                .body(LeaderboardResponseDTO.error(ex.getMessage()));
        }
    }
    // GET user cohort mappings by userId
    @GetMapping("/user/{userId}")
    public List<UserCohortMappingDTO> getUserCohortMappingsByUserId(@PathVariable String userId) {
        return userCohortMappingService.getUserCohortMappingsByUserId(userId);
    }
    
    @GetMapping("/mentor/{mentorId}/cohort/{cohortId}/users")
    public ResponseEntity<?> getUsersByCohortForMentor(
            @PathVariable String mentorId,
            @PathVariable String cohortId) {

        try {
            MentorCohortUsersResponseDTO response =
                    userCohortMappingService.getUsersByCohortForMentor(mentorId, cohortId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unexpected error occurred"));
        }
    }


    // POST (create) a new user-cohort mapping
    @PostMapping("/create")
    public ResponseEntity<UserCohortMapping> createUserCohortMapping(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String cohortId = request.get("cohortId");
        try {
            UserCohortMapping createdMapping = userCohortMappingService.createUserCohortMapping(userId, cohortId);
            return ResponseEntity.ok(createdMapping);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(null);
        }
    }    
    
    @PostMapping("/bulkcreate")
    public ResponseEntity<Map<String, List<String>>> importUserCohortMappings(@RequestParam("file") MultipartFile file) {
        Map<String, List<String>> response = userCohortMappingService.importUserCohortMappingsWithResponse(file);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/cohort/{cohortId}")
    public ResponseEntity<String> updateUserCohortMappingByCohortId(
            @PathVariable String cohortId, 
            @RequestBody UserCohortMapping userCohortMapping) {
        try {
            userCohortMappingService.updateUserCohortMappingByCohortId(cohortId, userCohortMapping);
            return ResponseEntity.ok("User-Cohort mapping updated successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

 // PUT (update) an existing mapping by userId
    @PutMapping("/user/{userId}/cohort/{cohortId}")
    public ResponseEntity<UserCohortMapping> updateUserCohortMapping(
            @PathVariable String userId,
            @PathVariable String cohortId,
            @RequestBody UserCohortMapping userCohortMapping) {
        try {
            UserCohortMapping updatedMapping = userCohortMappingService.updateUserCohortMapping(userId, cohortId, userCohortMapping);
            return ResponseEntity.ok(updatedMapping);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
    // DELETE a specific mapping by userId
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUserCohortMappingByUserId(@PathVariable String userId) {
        userCohortMappingService.deleteUserCohortMappingByUserId(userId);
        return ResponseEntity.noContent().build();
    }
    // New endpoint to update leaderboard score from Google Forms
    @PutMapping("/update-score")
    public ResponseEntity<?> updateLeaderboardScore(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String cohortId = (String) request.get("cohortId");
            Integer scoreToAdd = Integer.valueOf(request.get("score").toString());
            
            UserCohortMappingDTO updatedMapping = userCohortMappingService.updateLeaderboardScore(userId, cohortId, scoreToAdd);
            return ResponseEntity.ok(updatedMapping);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred: " + ex.getMessage()));
        }
    }
    
     // Disable a user from a cohort
    @PostMapping("/user/{userId}/cohort/{cohortId}/disable")
    public ResponseEntity<?> disableUserFromCohort(
            @PathVariable String userId,
            @PathVariable String cohortId,
            @RequestBody Map<String, String> request) {
        
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Deactivation reason is required"));
            }
            
            UserCohortMapping updatedMapping = userCohortMappingService.disableUserFromCohort(userId, cohortId, reason);
            
            return ResponseEntity.ok(Map.of(
                "message", "User successfully disabled from cohort",
                "userCohortMapping", updatedMapping,
                "status", updatedMapping.getStatus(),
                "deactivatedAt", updatedMapping.getDeactivatedAt(),
                "deactivatedReason", updatedMapping.getDeactivatedReason()
            ));
            
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Error disabling user from cohort: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "An unexpected error occurred while disabling the user"));
        }
    }

     // Reactivate a user in a cohort
    @PostMapping("/user/{userId}/cohort/{cohortId}/reactivate")
    public ResponseEntity<?> reactivateUserInCohort(
            @PathVariable String userId,
            @PathVariable String cohortId) {
        
        try {
            UserCohortMapping updatedMapping = userCohortMappingService.reactivateUserInCohort(userId, cohortId);
            
            return ResponseEntity.ok(Map.of(
                "message", "User successfully reactivated in cohort",
                "userCohortMapping", updatedMapping,
                "status", updatedMapping.getStatus()
            ));
            
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Error reactivating user in cohort: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "An unexpected error occurred while reactivating the user"));
        }
    }

    // Get deactivation details for a user in cohort
    @GetMapping("/user/{userId}/cohort/{cohortId}/deactivation-details")
    public ResponseEntity<?> getDeactivationDetails(
            @PathVariable String userId,
            @PathVariable String cohortId) {
        
        try {
            String deactivationDetails = userCohortMappingService.getDeactivationDetails(userId, cohortId);
            
            return ResponseEntity.ok(Map.of(
                "userId", userId,
                "cohortId", cohortId,
                "deactivationDetails", deactivationDetails
            ));
            
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Error getting deactivation details: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "An unexpected error occurred while fetching deactivation details"));
        }
    }

    
    // Bulk disable users from a cohort
//    @PostMapping("/cohort/{cohortId}/bulk-disable")
//    public ResponseEntity<?> bulkDisableUsersFromCohort(
//            @PathVariable String cohortId,
//            @RequestBody BulkUserCohortOperationRequest request) {
//        
//        try {
//            List<String> userIds = request.getUserIds();
//            String reason = request.getReason();
//            
//            if (userIds == null || userIds.isEmpty()) {
//                return ResponseEntity.badRequest()
//                    .body(Map.of("error", "User IDs list cannot be empty"));
//            }
//            if (reason == null || reason.trim().isEmpty()) {
//                return ResponseEntity.badRequest()
//                    .body(Map.of("error", "Deactivation reason is required"));
//            }
//            
//            List<BulkOperationResult> results = new ArrayList<>();
//            int successCount = 0;
//            int failureCount = 0;
//            
//            for (String userId : userIds) {
//                try {
//                    UserCohortMapping updatedMapping = userCohortMappingService.disableUserFromCohort(userId, cohortId, reason);
//                    results.add(new BulkOperationResult(userId, "SUCCESS", "User disabled successfully"));
//                    successCount++;
//                } catch (Exception e) {
//                    results.add(new BulkOperationResult(userId, "FAILED", e.getMessage()));
//                    failureCount++;
//                }
//            }
//            
//            return ResponseEntity.ok(Map.of(
//                "message", String.format("Bulk disable operation completed. Success: %d, Failed: %d", successCount, failureCount),
//                "totalProcessed", userIds.size(),
//                "successCount", successCount,
//                "failureCount", failureCount,
//                "results", results
//            ));
//            
//        } catch (Exception ex) {
//            logger.error("Error in bulk disable operation: {}", ex.getMessage(), ex);
//            return ResponseEntity.internalServerError()
//                .body(Map.of("error", "An unexpected error occurred during bulk disable operation"));
//        }
//    }
}
