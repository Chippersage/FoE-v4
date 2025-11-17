package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.service.*;
import com.FlowofEnglish.dto.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/user-session-mappings")
public class UserSessionMappingController {

    @Autowired
    private UserSessionMappingService userSessionMappingService;
    
    private static final Logger logger = LoggerFactory.getLogger(UserSessionMappingController.class);

    @GetMapping
    public List<UserSessionMapping> getAllUserSessionMappings() {
        return userSessionMappingService.getAllUserSessionMappings();
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<UserSessionMapping> getUserSessionMappingById(@PathVariable String sessionId) {
        Optional<UserSessionMapping> userSessionMapping = userSessionMappingService.getUserSessionMappingById(sessionId);
        return userSessionMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSessionMapping>> getUserSessionMappingsByUserId(@PathVariable String userId) {
        List<UserSessionMapping> mappings = userSessionMappingService.getUserSessionMappingsByUserId(userId);
        return ResponseEntity.ok(mappings);
    }
    
     // Get latest 5 sessions for all users in a cohort
    @GetMapping("/cohort/{cohortId}/mentor/{mentorUserId}")
    public ResponseEntity<?> getLatestSessionsForCohortStructured(
            @PathVariable String cohortId,
            @PathVariable String mentorUserId) {
        try {
            CohortSessionsResponseDTO response = userSessionMappingService
                    .getLatestSessionsForCohortStructured(mentorUserId, cohortId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error fetching cohort sessions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
    
    // Get latest 5 sessions for a specific user in a cohort
    @GetMapping("/cohort/{cohortId}/mentor/{mentorUserId}/user/{targetUserId}")
    public ResponseEntity<?> getLatestSessionsForUserStructured(
            @PathVariable String cohortId,
            @PathVariable String mentorUserId,
            @PathVariable String targetUserId) {
        try {
            CohortSessionsResponseDTO response = userSessionMappingService
                    .getLatestSessionsForUserStructured(mentorUserId, targetUserId, cohortId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error fetching user sessions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
    
    // Unified endpoint using query parameters If targetUserId is provided, returns single user's data Otherwise returns all users in cohort
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestSessionsStructured(
            @RequestParam String mentorUserId,
            @RequestParam String cohortId,
            @RequestParam(required = false) String targetUserId) {
        try {
            if (targetUserId != null) {
                CohortSessionsResponseDTO response = userSessionMappingService
                        .getLatestSessionsForUserStructured(mentorUserId, targetUserId, cohortId);
                return ResponseEntity.ok(response);
            } else {
                CohortSessionsResponseDTO response = userSessionMappingService
                        .getLatestSessionsForCohortStructured(mentorUserId, cohortId);
                return ResponseEntity.ok(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error fetching sessions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    
    @PostMapping
    public UserSessionMapping createUserSessionMapping(@RequestBody UserSessionMapping userSessionMapping) {
        return userSessionMappingService.createUserSessionMapping(userSessionMapping);
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<UserSessionMapping> updateUserSessionMapping(@PathVariable String sessionId, @RequestBody UserSessionMapping userSessionMapping) {
        return ResponseEntity.ok(userSessionMappingService.updateUserSessionMapping(sessionId, userSessionMapping));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteUserSessionMapping(@PathVariable String sessionId) {
        userSessionMappingService.deleteUserSessionMapping(sessionId);
        return ResponseEntity.noContent().build();
    }
}
