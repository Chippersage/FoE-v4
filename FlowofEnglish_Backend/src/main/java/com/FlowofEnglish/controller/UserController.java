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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private UserCohortMappingService userCohortMappingService; 

    
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

    @PostMapping("/bulkcreate")
    public List<User> createUsers(@RequestBody List<User> users) {
        return userService.createUsers(users);
    }
    
    @PostMapping("/bulkcreate/csv")
    public ResponseEntity<Map<String, Object>> bulkCreateUsersFromCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "CSV file is missing."));
        }

        // Initialize a list to store error messages during user creation
        List<String> errorMessages = new ArrayList<>();
        
     // Track cohort information for each created user
        Map<String, String> userCohortInfo = new HashMap<>();


        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            // Parse the CSV and create users, but catch errors for already existing users
            List<User> createdUsers = userService.parseAndCreateUsersFromCsv(reader, errorMessages);

            // Successful user creation info
            List<Map<String, String>> createdUsersInfo = createdUsers.stream()
                .map(user -> {
                	String cohortId = userService.getCohortIdByUserId(user.getUserId());
                    userCohortInfo.put(user.getUserId(), cohortId);

                    return Map.of(
                        "userId", user.getUserId(),
                        "password", "Welcome123",
                        "cohortId", cohortId // Add cohortId to the response for each user
                    );
                })
                .collect(Collectors.toList());
            
            // Total users processed (successful + errors)
            String message = createdUsersInfo.size() + " users created successfully.";

            // Prepare the response
            Map<String, Object> response = new HashMap<>();
            response.put("message", message);
            response.put("createdUsersCount", createdUsersInfo.size()); // Number of users created
            response.put("createdUsers", createdUsersInfo); // List of created users
            
         // Prepare cohort summary
            Map<String, Long> cohortSummary = createdUsersInfo.stream()
                .collect(Collectors.groupingBy(
                    user -> user.get("cohortId"),
                    Collectors.counting()
                ));
            
            response.put("cohortSummary", cohortSummary); // How many users created in each cohort
            
            
            // Check if there are errors (already existing users)
            if (!errorMessages.isEmpty()) {
                response.put("errors", errorMessages); // Include error messages in response
            }

            return ResponseEntity.ok(response);

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
    public ResponseEntity<String> deleteUser(@PathVariable("id") String userId) {
        try {
            // Call the service method to delete the user and return the response
            String message = userService.deleteUser(userId);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<String> deleteUsers(@RequestBody List<String> userIds) {
        String resultMessage = userService.deleteUsers(userIds);
        return ResponseEntity.ok(resultMessage);
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
        
        Optional<User> userOpt = userService.findByUserId(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("Stored password: " + user.getUserPassword());

            // Debugging the user type
            System.out.println("User Type: " + user.getUserType());

            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
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
                response.put("error", "Invalid userpassword");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } else {
            response.put("error", "Invalid userId");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
  
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> resetData) {
        String userId = resetData.get("userId");
        String newPassword = resetData.get("newPassword");

        boolean isResetSuccessful = userService.resetPassword(userId, newPassword);

        if (isResetSuccessful) {
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

    
    
    
