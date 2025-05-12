package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

import com.FlowofEnglish.service.*;
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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
	
    @Autowired
    private UserService userService;
    
    @Autowired
    private CohortRepository cohortRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    @Autowired
    private UserSessionMappingService userSessionMappingService;
    
    @Autowired
    private UserAssignmentService userAssignmentService;
    
    @Autowired
    private HttpSession session;

    @Autowired
    private UserCohortMappingService userCohortMappingService; 

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EmailService.class);

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
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            User updatedUser = userService.updateUser(id, user);
            response.put("success", true);
            response.put("data", updatedUser);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
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

//   // Signin Method
//     @PostMapping("/signin")
//    public ResponseEntity<?> signin(@RequestBody Map<String, String> loginData ) {
//        String userId = loginData.get("userId");
//        String userPassword = loginData.get("userPassword");
//        String expectedUserType = loginData.get("userType");
//        
//        // Debug logging
//        System.out.println("Received userId: " + userId);
//        System.out.println("Received password: " + userPassword);
//        System.out.println("Received userType: " + expectedUserType);
//        
//        // Initialize response map
//        Map<String, Object> response = new HashMap<>();
//        
//        // Perform a case-sensitive lookup in the database
//        Optional<User> userOpt = userRepository.findByUserId(userId); // Ensure findByUserId is case-sensitive
//
//        if (userOpt.isPresent()) {
//            User user = userOpt.get();
//            
//            // Validate exact case-sensitive userId
//            if (!user.getUserId().equals(userId)) {
//                response.put("error", "Invalid userId. Please enter the correct case-sensitive userId.");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//            
//            // Check user type
//            if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
//                response.put("error", "Invalid userType.");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//            
//            // Debugging the user type
//            System.out.println("User Type: " + user.getUserType());
//
//            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
////            	// Set temporary session attribute
////                session.setAttribute("tempUserId", userId);
////                
////                // Generate temporary session ID
////                String tempSessionId = UUID.randomUUID().toString();
////                session.setAttribute("tempSessionId", tempSessionId);
////                // Set a cookie as well for redundancy
////                Cookie tempSessionCookie = new Cookie("tempSessionId", tempSessionId);
////                tempSessionCookie.setPath("/");
////                tempSessionCookie.setHttpOnly(true);
////                tempSessionCookie.setMaxAge(3600); // 1 hour expiration
////                httpServletResponse.addCookie(tempSessionCookie);
//                // Fetch user details with cohorts and programs
//                UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);
//
//                response.put("message", "Successfully logged in as " + user.getUserType() + ".");
//              //  response.put("tempSessionId", tempSessionId); // Add session ID to response
//                response.put("userType", user.getUserType());
//                response.put("userDetails", userDetailsDTO); 
//                
//
//                // Add cohort end-date reminders for all active cohorts
//                List<String> cohortReminders = new ArrayList<>();
//                if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//                    for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                        if (cohort.getCohortEndDate() != null) {
//                            OffsetDateTime cohortEndDate = cohort.getCohortEndDate();
//                            OffsetDateTime today = OffsetDateTime.now(ZoneOffset.UTC);
//                            
//                            long daysUntilEnd = today.until(cohortEndDate, ChronoUnit.DAYS);
//                            if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
//                                cohortReminders.add(String.format("Cohort %s ends in %d day(s). Please complete your activities.", 
//                                    cohort.getCohortName(), daysUntilEnd));
//                            } else if (daysUntilEnd == 0) {
//                                cohortReminders.add(String.format("Cohort %s ends today. Please complete your activities. If you need extra time, contact your admin for an extension.",
//                                    cohort.getCohortName()));
//                            }
//                        }
//                    }
//                    if (!cohortReminders.isEmpty()) {
//                        response.put("cohortReminders", cohortReminders);
//                    }
//                }
//                
//                return ResponseEntity.ok(response);
//            
//            } else {
//                response.put("error", "Invalid userpassword");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//        } else {
//            response.put("error", "Invalid userId");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> loginData) {
        String userId = loginData.get("userId");
        String userPassword = loginData.get("userPassword");
        String expectedUserType = loginData.get("userType");
        
        // Debug logging
        System.out.println("Received userId: " + userId);
        System.out.println("Received password: " + userPassword);
        System.out.println("Received userType: " + expectedUserType);
        
        // Initialize response map
        Map<String, Object> response = new HashMap<>();
        
        // Perform a case-sensitive lookup in the database
        Optional<User> userOpt = userRepository.findByUserId(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Validate exact case-sensitive userId
            if (!user.getUserId().equals(userId)) {
                response.put("error", "Invalid userId. Please enter the correct case-sensitive userId.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Check user type
            if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
                response.put("error", "Invalid userType.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Debugging the user type
            System.out.println("User Type: " + user.getUserType());

            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
                UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);

                response.put("message", "Successfully logged in as " + user.getUserType() + ".");
                response.put("userType", user.getUserType());
                response.put("userDetails", userDetailsDTO);
                
                // Add assignment statistics for mentor login only
                if ("mentor".equalsIgnoreCase(user.getUserType())) {
                    Map<String, Object> assignmentStats = new HashMap<>();
                    
                    // Get all cohorts associated with this mentor
                    List<String> mentorCohortIds = new ArrayList<>();
                    if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
                        for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
                            mentorCohortIds.add(cohort.getCohortId());
                        }
                    }
                    
                    // Aggregated statistics across all mentor's cohorts
                    int totalCohortUserCount = 0;
                    int totalAssignments = 0;
                    int totalCorrectedAssignments = 0;
                    int totalPendingAssignments = 0;
                    
                    // Detailed statistics per cohort
                    Map<String, Map<String, Object>> cohortStatistics = new HashMap<>();
                    
                    // Calculate statistics for each cohort
                    for (String cohortId : mentorCohortIds) {
                        // Get user count for this cohort
                        int cohortUserCount = getUserCountInCohort(cohortId);
                        totalCohortUserCount += cohortUserCount;
                        
                        // Get assignments for this cohort
                        List<UserAssignment> assignments = userAssignmentService.getAssignmentsByCohortId(cohortId);
                        int cohortTotalAssignments = assignments.size();
                        totalAssignments += cohortTotalAssignments;
                        
                        // Count corrected vs pending assignments
                        int cohortCorrectedAssignments = 0;
                        int cohortPendingAssignments = 0;
                        
                        for (UserAssignment assignment : assignments) {
                            if (assignment.getCorrectedDate() != null) {
                                cohortCorrectedAssignments++;
                                totalCorrectedAssignments++;
                            } else {
                                cohortPendingAssignments++;
                                totalPendingAssignments++;
                            }
                        }
                        
                        // Store cohort-specific statistics
                        Map<String, Object> cohortStats = new HashMap<>();
                        cohortStats.put("cohortUserCount", cohortUserCount);
                        cohortStats.put("totalAssignments", cohortTotalAssignments);
                        cohortStats.put("correctedAssignments", cohortCorrectedAssignments);
                        cohortStats.put("pendingAssignments", cohortPendingAssignments);
                        
                        // Add to cohort statistics map
                        cohortStatistics.put(cohortId, cohortStats);
                    }
                    
                    // Create aggregate statistics
                    assignmentStats.put("totalCohortUserCount", totalCohortUserCount);
                    assignmentStats.put("totalAssignments", totalAssignments);
                    assignmentStats.put("correctedAssignments", totalCorrectedAssignments);
                    assignmentStats.put("pendingAssignments", totalPendingAssignments);
                    assignmentStats.put("cohortDetails", cohortStatistics);
                    
                    // Add assignment statistics to response
                    response.put("assignmentStatistics", assignmentStats);
                }

                // Add cohort end-date reminders for all active cohorts
                List<String> cohortReminders = new ArrayList<>();
                List<String> endedCohortReminders = new ArrayList<>();
                
                OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
                OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);

                if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
                    for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
                        if (cohort.getCohortEndDate() != null) {
                            OffsetDateTime cohortEndDate = cohort.getCohortEndDate().truncatedTo(ChronoUnit.DAYS);
                            long daysUntilEnd = ChronoUnit.DAYS.between(nowDateOnly, cohortEndDate);

                            // Check for upcoming end dates
                            if (daysUntilEnd > 0 && daysUntilEnd <= 15) {
                                cohortReminders.add(String.format(
                                    "Your cohort '%s' ends in %d day(s). Make sure to complete your assignments and activities.",
                                    cohort.getCohortName(), daysUntilEnd));
                            } 
                            // Check for cohorts ending today
                            else if (daysUntilEnd == 0) {
                                cohortReminders.add(String.format(
                                    "Your cohort '%s' ends today! Please complete any pending work immediately.",
                                    cohort.getCohortName()));
                            }
                            // Check for ended cohorts
                            else if (cohortEndDate.isBefore(nowDateOnly)) {
                                endedCohortReminders.add(String.format(
                                    "Your cohort '%s' has ended on %s. No further activities are possible.",
                                    cohort.getCohortName(), 
                                    cohort.getCohortEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
                            }
                        }
                    }
                    
                    // Add reminders to response
                    if (!cohortReminders.isEmpty()) {
                        response.put("cohortReminders", cohortReminders);
                    }
                    
                    // Add ended cohort reminders to response
                    if (!endedCohortReminders.isEmpty()) {
                        response.put("endedCohortReminders", endedCohortReminders);
                    }
                }
                
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

    /**
     * Helper method to get the count of users in a cohort
     * @param cohortId the ID of the cohort
     * @return the number of users in the cohort
     */
    private int getUserCountInCohort(String cohortId) {
        // Use a repository method to get the count
        return userCohortMappingRepository.countByCohortCohortId(cohortId);
    }
    
    @PostMapping("/select-cohort")
    public ResponseEntity<?> selectCohort(@RequestBody Map<String, String> cohortData) {
        // Get values from request body
        String selectedCohortId = cohortData.get("cohortId");
        String userId = cohortData.get("userId");
        logger.info("Request userId: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        
        // Validate cohortId
        if (selectedCohortId == null || selectedCohortId.trim().isEmpty()) {
            response.put("error", "CohortId is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Fetch user and validate cohort assignment
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (!userOpt.isPresent()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        User user = userOpt.get();
        
        // Fetch user's cohorts to validate if the selected cohort is assigned to the user
        UserDetailsWithCohortsAndProgramsDTO userDetails = 
            userService.getUserDetailsWithCohortsAndPrograms(userId);
        
        boolean cohortFound = false;
        if (userDetails.getAllCohortsWithPrograms() != null) {
            cohortFound = userDetails.getAllCohortsWithPrograms().stream()
                .anyMatch(cohort -> cohort.getCohortId().equals(selectedCohortId));
        }
        
        if (!cohortFound) {
            response.put("error", "Selected cohort is not assigned to the user");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Fetch cohort
        Optional<Cohort> cohortOpt = cohortRepository.findById(selectedCohortId);
        if (!cohortOpt.isPresent()) {
            response.put("error", "Invalid cohort");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        Cohort selectedCohort = cohortOpt.get();

     // Check if cohort end date is today or in the past
     OffsetDateTime cohortEndDate = selectedCohort.getCohortEndDate();
     OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
     
     // Truncate both dates to remove time components
     OffsetDateTime endDateOnly = cohortEndDate != null 
         ? cohortEndDate.withHour(0).withMinute(0).withSecond(0).withNano(0)
         : null;
     OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        
  // If cohort end date is null, proceed with selection
     if (cohortEndDate == null) {
         // Proceed with cohort selection
         try {
             // Check for existing active sessions
             userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
             
             // Create new session
             UserSessionMapping userSession = new UserSessionMapping();
             String newSessionId = UUID.randomUUID().toString();
             userSession.setSessionId(newSessionId);
             userSession.setUser(user);
             userSession.setCohort(selectedCohort);
             userSession.setSessionStartTimestamp(now);
             userSession.setUuid(UUID.randomUUID().toString());
             
             // Save new session
             userSessionMappingService.createUserSessionMapping(userSession);
             
             // Update session attributes
             session.setAttribute("userId", userId);
             session.setAttribute("cohortId", selectedCohortId);
             session.setAttribute("sessionId", newSessionId);
        
             response.put("message", "Cohort selected successfully");
             response.put("sessionId", newSessionId);
             response.put("cohortId", selectedCohortId);
             response.put("userId", userId);
             
             return ResponseEntity.ok(response);
             
         } catch (Exception e) {
             response.put("error", "Error creating session: " + e.getMessage());
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
         }
     }

     // Check if cohort end date is exactly today
     if (endDateOnly.isEqual(nowDateOnly)) {
         // Cohort is ending today, allow selection
         try {
             // Check for existing active sessions
             userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
             
             // Create new session
             UserSessionMapping userSession = new UserSessionMapping();
             String newSessionId = UUID.randomUUID().toString();
             userSession.setSessionId(newSessionId);
             userSession.setUser(user);
             userSession.setCohort(selectedCohort);
             userSession.setSessionStartTimestamp(now);
             userSession.setUuid(UUID.randomUUID().toString());
             
             // Save new session
             userSessionMappingService.createUserSessionMapping(userSession);
             
             // Update session attributes
             session.setAttribute("userId", userId);
             session.setAttribute("cohortId", selectedCohortId);
             session.setAttribute("sessionId", newSessionId);
        
             response.put("message", "Cohort selected successfully on its final day");
             response.put("sessionId", newSessionId);
             response.put("cohortId", selectedCohortId);
             response.put("userId", userId);
             
             return ResponseEntity.ok(response);
             
         } catch (Exception e) {
             response.put("error", "Error creating session: " + e.getMessage());
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
         }
     }

     // Check if cohort end date has passed
     if (endDateOnly.isBefore(nowDateOnly)) {
         // Cohort has ended
         response.put("error", String.format("This cohort has ended on %s. You cannot select this cohort.", 
             cohortEndDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
     }

     // If cohort end date is in the future, proceed with selection
     try {
         // Check for existing active sessions
         userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
         
         // Create new session
         UserSessionMapping userSession = new UserSessionMapping();
         String newSessionId = UUID.randomUUID().toString();
         userSession.setSessionId(newSessionId);
         userSession.setUser(user);
         userSession.setCohort(selectedCohort);
         userSession.setSessionStartTimestamp(now);
         userSession.setUuid(UUID.randomUUID().toString());
         
         // Save new session
         userSessionMappingService.createUserSessionMapping(userSession);
         
         // Update session attributes
         session.setAttribute("userId", userId);
         session.setAttribute("cohortId", selectedCohortId);
         session.setAttribute("sessionId", newSessionId);
    
         response.put("message", "Cohort selected successfully");
         response.put("sessionId", newSessionId);
         response.put("cohortId", selectedCohortId);
         response.put("userId", userId);
         
         return ResponseEntity.ok(response);
         
     } catch (Exception e) {
         response.put("error", "Error creating session: " + e.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
            




//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
//    	String userId = loginData.get("userId");
//        String userPassword = loginData.get("userPassword");
//        String expectedUserType = loginData.get("userType");
//        // Debug logging
//        System.out.println("Received userId: " + userId);
//        System.out.println("Received password: " + userPassword);
//        System.out.println("Received userType: " + expectedUserType);
//        
//     // Initialize response map
//        Map<String, Object> response = new HashMap<>();
//     // Perform a case-sensitive lookup in the database
//        Optional<User> userOpt = userRepository.findByUserId(userId); // Ensure findByUserId is case-sensitive
//
//        
//        if (userOpt.isPresent()) {
//            User user = userOpt.get();
//            
//         // Validate exact case-sensitive userId
//            if (!user.getUserId().equals(userId)) {
//                response.put("error", "Invalid userId. Please enter the correct case-sensitive userId.");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//            
//         // Check user type
//            if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
//                response.put("error", "Invalid userType.");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//            
//            // Debugging the user type
//           System.out.println("User Type: " + user.getUserType());
//
//            if (userService.verifyPassword(userPassword, user.getUserPassword())) {
//            	
//            	// Set session attribute with userId to track user session
//                session.setAttribute("userId", userId);
//                
//                // Generate session ID
//                String sessionId = session.getId();
//             
//             // Fetch user details with cohorts and programs
//                UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);
//                
//                    // Store session details in UserSessionMapping table
//                    UserSessionMapping userSession = new UserSessionMapping();
//                    userSession.setSessionId(sessionId);
//                 // Convert LocalDateTime.now() to OffsetDateTime with the desired offset (e.g., UTC)
//                    OffsetDateTime currentOffsetDateTime = OffsetDateTime.now(ZoneOffset.UTC);
//                    userSession.setSessionStartTimestamp(currentOffsetDateTime);
//                    userSession.setUser(user);
//                 // Explicitly generate UUID if needed
//                    if (userSession.getUuid() == null) {
//                        userSession.setUuid(UUID.randomUUID().toString());
//                    }
//                    userSessionMappingService.createUserSessionMapping(userSession);
//
//                 
//                response.put("message", "Successfully logged in as " + user.getUserType() + ".");
//                response.put("userType", user.getUserType());
//                response.put("userDetails", userDetailsDTO); 
//                response.put("sessionId", sessionId); // Add session ID to response
//
//             // Add cohort end-date reminders for all active cohorts
//                List<String> cohortReminders = new ArrayList<>();
//                if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//                    for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                        if (cohort.getCohortEndDate() != null) {
//                            OffsetDateTime cohortEndDate = cohort.getCohortEndDate();
//                            OffsetDateTime today = OffsetDateTime.now(ZoneOffset.UTC);
//                            
//                            long daysUntilEnd = today.until(cohortEndDate, ChronoUnit.DAYS);
//                            if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
//                                cohortReminders.add(String.format("Cohort %s ends in %d day(s). Please complete your activities.", 
//                                    cohort.getCohortName(), daysUntilEnd));
//                            } else if (daysUntilEnd == 0) {
//                                cohortReminders.add(String.format("Cohort %s ends today. Please complete your activities. If you need extra time, contact your admin for an extension.",
//                                    cohort.getCohortName()));
//                            }
//                        }
//                    }
//                    if (!cohortReminders.isEmpty()) {
//                        response.put("cohortReminders", cohortReminders);
//                    }
//                }
//                
//                return ResponseEntity.ok(response);
//            
//           }else {
//                response.put("error", "Invalid userpassword");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//            }
//        } else {
//            response.put("error", "Invalid userId");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
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
        System.out.println("Received userType: " + expectedUserType);
        
     // Initialize response map
        Map<String, Object> response = new HashMap<>();
        
      //  Optional<User> userOpt = Optional.ofNullable(userRepository.findByUserId(userId));
        
     // Perform a case-sensitive lookup in the database
        Optional<User> userOpt = userRepository.findByUserId(userId); // Ensure findByUserId is case-sensitive

        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
         // Validate exact case-sensitive userId
            if (!user.getUserId().equals(userId)) {
                response.put("error", "Invalid userId. Please enter the correct case-sensitive userId.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
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

             // Include cohort end-date reminder
                if (userCohortMapping.getCohort().getCohortEndDate() != null) {
                    OffsetDateTime cohortEndDate = userCohortMapping.getCohort().getCohortEndDate();
                    OffsetDateTime today = OffsetDateTime.now(ZoneOffset.UTC);

                    long daysUntilEnd = today.until(cohortEndDate, java.time.temporal.ChronoUnit.DAYS);
                    if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
                        response.put("cohortReminder", "Your cohort ends in " + daysUntilEnd + " day(s). Please complete your activities.");
                    } else if (daysUntilEnd == 0) {
                        response.put("cohortReminder", "Your cohort ends today. Please complete your activities.  If you need extra time, contact your admin for an extension.");
                    }
                }
                
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
  
    
}