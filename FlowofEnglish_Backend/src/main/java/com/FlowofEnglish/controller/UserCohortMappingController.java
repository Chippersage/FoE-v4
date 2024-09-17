package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.service.UserCohortMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/user-cohort-mappings")
public class UserCohortMappingController {

    @Autowired
    private UserCohortMappingService userCohortMappingService;

    // GET all mappings
    @GetMapping
    public List<UserCohortMapping> getAllUserCohortMappings() {
        return userCohortMappingService.getAllUserCohortMappings();
    }

    // GET a specific mapping by leaderboardScore
    @GetMapping("/{leaderboardScore}")
    public ResponseEntity<UserCohortMapping> getUserCohortMappingById(@PathVariable int leaderboardScore) {
        Optional<UserCohortMapping> userCohortMapping = userCohortMappingService.getUserCohortMappingById(leaderboardScore);
        return userCohortMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST (create) a new user-cohort mapping
    @PostMapping("/create")
    public UserCohortMapping createUserCohortMapping(@RequestBody UserCohortMapping userCohortMapping) {
        return userCohortMappingService.createUserCohortMapping(userCohortMapping);
    }

    // PUT (update) an existing mapping by leaderboardScore
    @PutMapping("/{leaderboardScore}")
    public ResponseEntity<UserCohortMapping> updateUserCohortMapping(@PathVariable int leaderboardScore, @RequestBody UserCohortMapping userCohortMapping) {
        return ResponseEntity.ok(userCohortMappingService.updateUserCohortMapping(leaderboardScore, userCohortMapping));
    }

    // DELETE a specific mapping by leaderboardScore
    @DeleteMapping("/{leaderboardScore}")
    public ResponseEntity<Void> deleteUserCohortMapping(@PathVariable int leaderboardScore) {
        userCohortMappingService.deleteUserCohortMapping(leaderboardScore);
        return ResponseEntity.noContent().build();
    }
}








//@RestController
//@RequestMapping("/api/v1/user-cohort-mappings")
//public class UserCohortMappingController {
//
//    @Autowired
//    private UserCohortMappingService userCohortMappingService;
//
//    @GetMapping
//    public List<UserCohortMapping> getAllUserCohortMappings() {
//        return userCohortMappingService.getAllUserCohortMappings();
//    }
//
//    @GetMapping("/{leaderboardScore}")
//    public ResponseEntity<UserCohortMapping> getUserCohortMappingById(@PathVariable int leaderboardScore) {
//        Optional<UserCohortMapping> userCohortMapping = userCohortMappingService.getUserCohortMappingById(leaderboardScore);
//        return userCohortMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
////    @PostMapping("/create")
////    public UserCohortMapping createUserCohortMapping(@RequestBody UserCohortMapping userCohortMapping) {
////        return userCohortMappingService.createUserCohortMapping(userCohortMapping);
////    }
//    
// // Corrected endpoint for creating user cohort mapping
//    @PostMapping("/create")
//    public UserCohortMapping createUserCohortMapping(@RequestBody UserCohortMapping userCohortMapping) {
//        return userCohortMappingService.createUserCohortMapping(userCohortMapping);
//    }
//
//    @PutMapping("/{leaderboardScore}")
//    public ResponseEntity<UserCohortMapping> updateUserCohortMapping(@PathVariable int leaderboardScore, @RequestBody UserCohortMapping userCohortMapping) {
//        return ResponseEntity.ok(userCohortMappingService.updateUserCohortMapping(leaderboardScore, userCohortMapping));
//    }
//
//    @DeleteMapping("/{leaderboardScore}")
//    public ResponseEntity<Void> deleteUserCohortMapping(@PathVariable int leaderboardScore) {
//        userCohortMappingService.deleteUserCohortMapping(leaderboardScore);
//        return ResponseEntity.noContent().build();
//    }
//}
