package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.service.UserCohortMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/user-cohort-mappings")
public class UserCohortMappingController {

    @Autowired
    private UserCohortMappingService userCohortMappingService;

    // GET all mappings
    @GetMapping
    public List<UserCohortMappingDTO> getAllUserCohortMappings() {
        return userCohortMappingService.getAllUserCohortMappings();
    }
    
 // GET user cohort mappings by cohortId
    @GetMapping("/cohort/{cohortId}")
    public List<UserCohortMappingDTO> getUserCohortMappingsByCohortId(@PathVariable String cohortId) {
        return userCohortMappingService.getUserCohortMappingsByCohortId(cohortId);
    }


    // GET user cohort mappings by userId
    @GetMapping("/user/{userId}")
    public List<UserCohortMappingDTO> getUserCohortMappingsByUserId(@PathVariable String userId) {
        return userCohortMappingService.getUserCohortMappingsByUserId(userId);
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
    @PutMapping("/user/{userId}")
    public ResponseEntity<UserCohortMapping> updateUserCohortMapping(@PathVariable String userId, @RequestBody UserCohortMapping userCohortMapping) {
        return ResponseEntity.ok(userCohortMappingService.updateUserCohortMapping(userId, userCohortMapping));
    }
    
    

    // DELETE a specific mapping by userId
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUserCohortMappingByUserId(@PathVariable String userId) {
        userCohortMappingService.deleteUserCohortMappingByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
