package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.service.UserCohortMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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

    // GET user cohort mappings by userId
    @GetMapping("/user/{userId}")
    public List<UserCohortMappingDTO> getUserCohortMappingsByUserId(@PathVariable String userId) {
        return userCohortMappingService.getUserCohortMappingsByUserId(userId);
    }

    // POST (create) a new user-cohort mapping
    @PostMapping("/create")
    public UserCohortMapping createUserCohortMapping(@RequestBody UserCohortMapping userCohortMapping) {
        return userCohortMappingService.createUserCohortMapping(userCohortMapping);
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
