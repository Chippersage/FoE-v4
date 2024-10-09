package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.model.UserSessionMapping;

import jakarta.servlet.http.HttpSession;

import com.FlowofEnglish.service.UserCohortMappingService;
import com.FlowofEnglish.service.UserService;
import com.FlowofEnglish.service.UserSessionMappingService;
import com.opencsv.CSVReader;
import org.springframework.web.multipart.MultipartFile;


import java.io.InputStreamReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserSessionMappingService userSessionMappingService;
    
    
    @Autowired
    private HttpSession session;

    @Autowired
    private UserCohortMappingService userCohortMappingService; // Add this line to inject UserCohortMappingService

    
    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organization/{organizationId}")
    public List<UserDTO> getUsersByOrganizationId(@PathVariable String organizationId) {
        return userService.getUsersByOrganizationId(organizationId);
    }
    

    @PostMapping("/create")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

//    @PostMapping("/bulkcreate")
//    public List<User> createUsers(@RequestBody List<User> users) {
//        return userService.createUsers(users);
//    }
    
    @PostMapping("/bulkcreate/csv")
    public ResponseEntity<Map<String, String>> bulkCreateUsersFromCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "CSV file is missing."));
        }

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<User> users = userService.parseAndCreateUsersFromCsv(reader);
            return ResponseEntity.ok(Map.of("message", "Users created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error processing CSV file: " + e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
 // New Login Method
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
    	String userId = loginData.get("userId");
        String userPassword = loginData.get("userPassword");

        // Debug logging
        System.out.println("Received userId: " + userId);
        System.out.println("Received password: " + userPassword);
        
     // Initialize response map
        Map<String, Object> response = new HashMap<>();


        // Use Optional to handle potential absence of user
        Optional<User> userOpt = userService.findByUserId(userId);
        

        if (userOpt.isPresent()) {
            User user = userOpt.get();  // Unwrap the Optional safely
            System.out.println("Stored password: " + user.getUserPassword()); // Debug: print stored password


            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
            	
            	// Check if user is using the default password
                if (userService.isDefaultPassword(user)) {
                    // Return a response directing to reset password page
                    return new ResponseEntity<>("Redirect to reset password page", HttpStatus.FOUND);
                }
            	
            	// Set session attribute with userId to track user session
                session.setAttribute("userId", userId);
                
                // Generate session ID
                String sessionId = session.getId();
             
             // Fetch the UserCohortMapping for the user using the instance
                UserCohortMapping userCohortMapping = userCohortMappingService.findByUserUserId(user.getUserId());

                
                if (userCohortMapping != null) {
                    // Store session details in UserSessionMapping table
                    UserSessionMapping userSession = new UserSessionMapping();
                    userSession.setSessionId(sessionId);
                    userSession.setSessionStartTimestamp(LocalDateTime.now());
                    userSession.setUser(user);
                    userSession.setCohort(userCohortMapping.getCohort());  // Set cohort from UserCohortMapping
                    
                 // Explicitly generate UUID if needed
                    if (userSession.getUuid() == null) {
                        userSession.setUuid(UUID.randomUUID().toString());
                    }
                    userSessionMappingService.createUserSessionMapping(userSession);
                } else {
                    // Handle case where userCohortMapping is not found
                    throw new RuntimeException("No cohort mapping found for user with ID: " + user.getUserId());
                }
                               
                
             // Fetch additional user details with cohort and program
                UserDTO userDTO = userService.getUserDetailsWithProgram(userId);
                response.put("userType", user.getUserType());
                response.put("userDetails", userDTO); // Include user details (with cohort and program)
                response.put("sessionId", sessionId); // Add session ID to response

                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Invalid password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } else {
            response.put("error", "Invalid userId");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String userId, @RequestParam String newPassword) {
        Optional<User> userOpt = userService.findByUserId(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setUserPassword(newPassword);  // Automatically encoded
            userService.updateUser(userId, user);
            return ResponseEntity.ok("Password reset successfully");
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }
    
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        String sessionId = session.getId();

        // Update the session end timestamp before logging out
        Optional<UserSessionMapping> sessionOpt = userSessionMappingService.getUserSessionMappingById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionMapping userSession = sessionOpt.get();
            userSession.setSessionEndTimestamp(LocalDateTime.now());
            userSessionMappingService.updateUserSessionMapping(sessionId, userSession);
        }

        // Invalidate the session to log out the user
        session.invalidate();
        return ResponseEntity.ok("Logout successful");
    }
        
} 
          

// this will be get the all details

//@GetMapping("/{userId}/details")
//public ResponseEntity<UserDTO> getUserDetailsWithProgram(@PathVariable String userId) {
//  UserDTO userDTO = userService.getUserDetailsWithProgram(userId);
//  return ResponseEntity.ok(userDTO);
//}

//@GetMapping
//public List<User> getAllUsers() {
//  return userService.getAllUsers();
//}
//
//@GetMapping("/{id}")
//public ResponseEntity<User> getUserById(@PathVariable String id) {
//  return userService.getUserById(id)
//          .map(ResponseEntity::ok)
//          .orElse(ResponseEntity.notFound().build());
//}
//
//@GetMapping("/organization/{organizationId}")
//public List<User> getUsersByOrganizationId(@PathVariable String organizationId) {
//  return userService.getUsersByOrganizationId(organizationId);
//}

    
    
    
