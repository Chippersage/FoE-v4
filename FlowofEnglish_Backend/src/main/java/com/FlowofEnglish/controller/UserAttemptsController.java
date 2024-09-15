package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.UserAttempts;
import com.FlowofEnglish.service.UserAttemptsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/user-attempts")
public class UserAttemptsController {

    @Autowired
    private UserAttemptsService userAttemptsService;

    @GetMapping
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsService.getAllUserAttempts();
    }

    @GetMapping("/{userAttemptId}")
    public ResponseEntity<UserAttempts> getUserAttemptById(@PathVariable int userAttemptId) {
        Optional<UserAttempts> userAttempt = userAttemptsService.getUserAttemptById(userAttemptId);
        return userAttempt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserAttempts createUserAttempt(@RequestBody UserAttempts userAttempt) {
        return userAttemptsService.createUserAttempt(userAttempt);
    }

    @PutMapping("/{userAttemptId}")
    public ResponseEntity<UserAttempts> updateUserAttempt(@PathVariable int userAttemptId, @RequestBody UserAttempts userAttempt) {
        return ResponseEntity.ok(userAttemptsService.updateUserAttempt(userAttemptId, userAttempt));
    }

    @DeleteMapping("/{userAttemptId}")
    public ResponseEntity<Void> deleteUserAttempt(@PathVariable int userAttemptId) {
        userAttemptsService.deleteUserAttempt(userAttemptId);
        return ResponseEntity.noContent().build();
    }
}
