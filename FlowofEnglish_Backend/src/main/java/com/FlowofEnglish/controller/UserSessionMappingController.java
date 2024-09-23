package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.UserSessionMapping;
import com.FlowofEnglish.service.UserSessionMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<UserSessionMapping> getUserSessionMappingById(@PathVariable int sessionId) {
        Optional<UserSessionMapping> userSessionMapping = userSessionMappingService.getUserSessionMappingById(sessionId);
        return userSessionMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserSessionMapping createUserSessionMapping(@RequestBody UserSessionMapping userSessionMapping) {
        return userSessionMappingService.createUserSessionMapping(userSessionMapping);
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<UserSessionMapping> updateUserSessionMapping(@PathVariable int sessionId, @RequestBody UserSessionMapping userSessionMapping) {
        return ResponseEntity.ok(userSessionMappingService.updateUserSessionMapping(sessionId, userSessionMapping));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteUserSessionMapping(@PathVariable int sessionId) {
        userSessionMappingService.deleteUserSessionMapping(sessionId);
        return ResponseEntity.noContent().build();
    }
}