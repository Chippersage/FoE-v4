package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.service.*;
import com.FlowofEnglish.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/user-session-mappings")
public class UserSessionMappingController {

    @Autowired
    private UserSessionMappingService userSessionMappingService;

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
    
        
        @GetMapping("/cohort/{cohortId}/mentor/{mentorUserId}")
        public ResponseEntity<?> getLatestSessionsForCohort(
                @PathVariable String cohortId,
                @PathVariable String mentorUserId) {
            try {
                List<UserSessionDTO> sessions = userSessionMappingService.getLatestSessionsForCohortWithMentorValidation(mentorUserId, cohortId);
                return ResponseEntity.ok(sessions);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
            }
        }

        @GetMapping("/cohort/{cohortId}/mentor/{mentorUserId}/user/{targetUserId}")
        public ResponseEntity<?> getLatestSessionForUser(
                @PathVariable String cohortId,
                @PathVariable String mentorUserId,
                @PathVariable String targetUserId) {
            try {
                UserSessionDTO session = userSessionMappingService.getLatestSessionForUserInCohort(mentorUserId, targetUserId, cohortId);
                return ResponseEntity.ok(session);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
            }
        }

        @GetMapping("/latest")
        public ResponseEntity<?> getLatestSession(
                @RequestParam String mentorUserId,
                @RequestParam String cohortId,
                @RequestParam(required = false) String targetUserId) {
            try {
                if (targetUserId != null) {
                    // Get specific user's latest session
                    UserSessionDTO session = userSessionMappingService.getLatestSessionForUserInCohort(mentorUserId, targetUserId, cohortId);
                    return ResponseEntity.ok(session);
                } else {
                    // Get all users' latest sessions in the cohort
                    List<UserSessionDTO> sessions = userSessionMappingService.getLatestSessionsForCohortWithMentorValidation(mentorUserId, cohortId);
                    return ResponseEntity.ok(sessions);
                }
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "An unexpected error occurred"));
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
