package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.dto.UserGetDTO;
import com.FlowofEnglish.dto.UsercreateDTO;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.model.UserSessionMapping;

import jakarta.servlet.http.HttpSession;

import com.FlowofEnglish.service.UserCohortMappingService;
import com.FlowofEnglish.service.UserService;
import com.FlowofEnglish.service.UserSessionMappingService;
import com.opencsv.CSVReader;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
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
    private UserCohortMappingService userCohortMappingService; 

    
    @GetMapping
    public List<UserGetDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserGetDTO> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organization/{organizationId}")
    public List<UserGetDTO> getUsersByOrganizationId(@PathVariable String organizationId) {
        return userService.getUsersByOrganizationId(organizationId);
    }
    

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody UsercreateDTO userDTO) {
        try {
            User createdUser = userService.createUser(userDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createdUser);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // bulk create with csv
    @PostMapping("/bulkcreate/csv")
    public ResponseEntity<Map<String, Object>> bulkCreateUsersFromCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File is empty"));
        }

        try (InputStream inputStream = file.getInputStream();
             InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
             CSVReader csvReader = new CSVReader(inputStreamReader)) {

            List<String> errorMessages = new ArrayList<>();
            List<String> warnings = new ArrayList<>();
         // Call the service method for bulk user creation from CSV
            Map<String, Object> result = userService.parseAndCreateUsersFromCsv(csvReader, errorMessages, warnings);

            // Preparing the response with details from the service
            return ResponseEntity.ok(Map.of(
                    "createdUserCount", result.get("createdUserCount"),
                    "createdUserCohortMappingCount", result.get("createdUserCohortMappingCount"),
                    "errorCount", result.get("errorCount"),
                    "warningCount", result.get("warningCount"),
                    "errors", errorMessages,
                    "warnings", warnings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
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

   // Login Method
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
    	String userId = loginData.get("userId");
        String userPassword = loginData.get("userPassword");
        String selectedProgramId = loginData.get("programId");
        String expectedUserType = loginData.get("userType");
        
        // Debug logging
        System.out.println("Received userId: " + userId);
        System.out.println("Received password: " + userPassword);
        System.out.println("Received programId: " + selectedProgramId);
        System.out.println("Expected userType: " + expectedUserType);
        
     // Initialize response map
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userService.findByUserId(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
         // Check user type
            if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
                response.put("error", "Invalid userType.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Debugging the user type
           System.out.println("User Type: " + user.getUserType());

            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
            	
            	// Set session attribute with userId to track user session
                session.setAttribute("userId", userId);
                
                // Generate session ID
                String sessionId = session.getId();
             
             // Check if the user is part of the selected program
                Optional<UserCohortMapping> userCohortMappingOpt = userCohortMappingService.findByUserUserIdAndProgramId(userId, selectedProgramId);
                
                if (userCohortMappingOpt.isPresent()) {
                    UserCohortMapping userCohortMapping = userCohortMappingOpt.get();
                   
                    // Store session details in UserSessionMapping table
                    UserSessionMapping userSession = new UserSessionMapping();
                    userSession.setSessionId(sessionId);
                 // Convert LocalDateTime.now() to OffsetDateTime with the desired offset (e.g., UTC)
                    OffsetDateTime currentOffsetDateTime = OffsetDateTime.now(ZoneOffset.UTC);
                    userSession.setSessionStartTimestamp(currentOffsetDateTime);
                    
                    userSession.setUser(user);
                    userSession.setCohort(userCohortMapping.getCohort());  // Set cohort from UserCohortMapping
                    
                 // Explicitly generate UUID if needed
                    if (userSession.getUuid() == null) {
                        userSession.setUuid(UUID.randomUUID().toString());
                    }
                    userSessionMappingService.createUserSessionMapping(userSession);
                    
                    
                 // Fetch additional user details with selected program and cohort
                UserDTO userDTO = userService.getUserDetailsWithProgram(userId, selectedProgramId);
                
                response.put("message", "Successfully logged in as " + user.getUserType() + ".");
                response.put("userType", user.getUserType());
                response.put("userDetails", userDTO); // Include user details (with cohort and program)
                response.put("sessionId", sessionId); // Add session ID to response

                return ResponseEntity.ok(response);
            }else {
                response.put("error", "User is not enrolled in the selected program.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            } 
           }else {
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
         // Convert LocalDateTime.now() to OffsetDateTime with the system's default offset
            OffsetDateTime currentOffsetDateTime = OffsetDateTime.now(ZoneOffset.UTC);
            userSession.setSessionEndTimestamp(currentOffsetDateTime);
            userSessionMappingService.updateUserSessionMapping(sessionId, userSession);
        }

        // Invalidate the session to log out the user
        session.invalidate();
        return ResponseEntity.ok("Logout successful");
    }
        
} 