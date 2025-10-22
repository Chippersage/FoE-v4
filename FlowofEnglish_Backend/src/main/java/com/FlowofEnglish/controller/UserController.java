package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.filter.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import com.FlowofEnglish.service.*;
import com.opencsv.CSVReader;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.*;
import java.io.*;
import jakarta.servlet.http.*;
import java.time.*;
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
    
    @Autowired
    private SingleDeviceLoginService singleDeviceLoginService;
    
    @Autowired
    private SessionValidationFilter sessionValidationFilter;
    

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserController.class);

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

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
        String userId = loginData.get("userId");
        String userPassword = loginData.get("userPassword");
        String expectedUserType = loginData.get("userType");
        
        logger.debug("Login attempt - userId: {}, userType: {}", userId, expectedUserType);
        
        // Initialize response map
        Map<String, Object> response = new HashMap<>();
        
        // Check if required fields are provided
        if (userId == null || userPassword == null || expectedUserType == null) {
            response.put("error", "User ID, password, and user type are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Perform a case-sensitive lookup in the database
        Optional<User> userOpt = userRepository.findByUserId(userId);

        if (userOpt.isEmpty()) {
            logger.debug("Login failed - User ID not found: {}", userId);
            response.put("error", "Oops! Invalid userId");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = userOpt.get();
        
        // Check if user is active
        if (!user.isActive()) {
            logger.debug("Login failed - User account deactivated: {}", userId);
            return buildDeactivatedUserResponse(user);
        }

        // Validate exact case-sensitive userId
        if (!user.getUserId().equals(userId)) {
            logger.debug("Login failed - Case mismatch for userId: {} vs {}", userId, user.getUserId());
            response.put("error", "Oops! User ID not found. Please check the User ID");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Check user type
        if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
            logger.debug("Login failed - User type mismatch for {}: expected {}, found {}", 
                    userId, expectedUserType, user.getUserType());
            response.put("error", "Invalid user type. Please ensure you're logging in with the correct user type.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Verify password
        if (!userService.verifyPassword(userPassword, user.getUserPassword())) {
            logger.debug("Login failed - Invalid password for user: {}", userId);
            response.put("error", "Oops! Invalid userpassword");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
     // ===== SINGLE DEVICE LOGIN LOGIC =====
        // Handle single device login before creating new session
        if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
            // Extract device fingerprint from request
            String deviceFingerprint = extractDeviceFingerprint(request, loginData);
            logger.debug("Device fingerprint for user {}: {}", userId, deviceFingerprint);
            
            // Check device login permission first
            SingleDeviceLoginService.DeviceLoginCheckResult deviceCheck = 
                singleDeviceLoginService.checkDeviceLoginPermission(userId, deviceFingerprint);
            
            if (!deviceCheck.isAllowed()) {
                logger.warn("Device login denied for user: {} - {}", userId, deviceCheck.getMessage());
                response.put("error", deviceCheck.getMessage());
                response.put("errorCode", deviceCheck.getErrorCode());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            // Handle single device login with device fingerprinting
            SingleDeviceLoginService.SingleDeviceLoginResult singleDeviceResult = 
                singleDeviceLoginService.handleSingleDeviceLogin(userId, null, deviceFingerprint);
            
            if (!singleDeviceResult.isSuccess()) {
                logger.error("Single device login handling failed for user: {} - {}", userId, singleDeviceResult.getErrorMessage());
                response.put("error", "Login failed due to session management error. Please try again.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
            // Log single device login results
            if (singleDeviceResult.getTerminatedSessionCount() > 0) {
                logger.info("Single device login - terminated {} existing session(s) for user: {}", 
                    singleDeviceResult.getTerminatedSessionCount(), userId);
            }
            
            // Store device fingerprint in response for frontend tracking
            response.put("deviceFingerprint", deviceFingerprint);
        }
        // ===== END SINGLE DEVICE LOGIN LOGIC =====
        
        // Authentication successful - invalidate any existing sessions for this user
        try {
            userSessionMappingService.invalidateAllUserSessions(userId);
        } catch (Exception e) {
            logger.warn("Error invalidating existing sessions for user: {}", userId, e);
        }
        
        // Prepare login response WITHOUT cohort details to avoid caching issues
        logger.info("Successful login - User: {}, Type: {}", userId, user.getUserType());
        
        // Build Organization details for login response
        Map<String, Object> organizationInfo = new HashMap<>();
        Organization org = user.getOrganization();
        organizationInfo.put("organizationId", org.getOrganizationId());
        organizationInfo.put("organizationName", org.getOrganizationName());
        organizationInfo.put("organizationAdminName", org.getOrganizationAdminName());
        organizationInfo.put("organizationAdminEmail", org.getOrganizationAdminEmail());
        organizationInfo.put("organizationAdminPhone", org.getOrganizationAdminPhone());
        
        // Build  user details for login response
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("userId", user.getUserId());
        userDetails.put("userName", user.getUserName());
        userDetails.put("userEmail", user.getUserEmail());
        userDetails.put("userPhoneNumber", user.getUserPhoneNumber());
        userDetails.put("userAddress", user.getUserAddress());
        userDetails.put("userType", user.getUserType());
        userDetails.put("status", user.getStatus());
        userDetails.put("createdAt", user.getCreatedAt());
        userDetails.put("deactivatedAt", user.getDeactivatedAt());
        userDetails.put("deactivatedReason", user.getDeactivatedReason());
        userDetails.put("organization", organizationInfo);

     // Add final response fields
        String loginMessage = "Successfully logged in as " + user.getUserType() + ".";
        
        // Add single device login notification if sessions were terminated
        if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
            SingleDeviceLoginService.SingleDeviceLoginResult lastResult = 
                (SingleDeviceLoginService.SingleDeviceLoginResult) request.getAttribute("singleDeviceResult");
            if (lastResult != null && lastResult.getTerminatedSessionCount() > 0) {
                loginMessage += " Your previous session on another device has been terminated.";
            }
        }
        
        // Add final response fields
        response.put("message", "Successfully logged in as " + user.getUserType() + ".");
        response.put("userType", user.getUserType());
        response.put("userDetails", userDetails);
        
     // Add single device login info to response
        if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
            response.put("singleDeviceLogin", true);
            SingleDeviceLoginService.SingleDeviceLoginResult lastResult = 
                (SingleDeviceLoginService.SingleDeviceLoginResult) request.getAttribute("singleDeviceResult");
            if (lastResult != null && lastResult.getTerminatedSessionCount() > 0) {
                response.put("terminatedSessions", lastResult.getTerminatedSessionCount());
            }
        }
        
        // Add cache control headers to prevent caching of login response
        HttpServletResponse httpResponse = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getResponse();
        if (httpResponse != null) {
            httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            httpResponse.setHeader("Pragma", "no-cache");
            httpResponse.setHeader("Expires", "0");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Extract device fingerprint from HTTP request and login data
     */
    private String extractDeviceFingerprint(HttpServletRequest request, Map<String, String> loginData) {
        // Try to get device fingerprint from request body first (sent by frontend)
        String frontendFingerprint = loginData.get("deviceFingerprint");
        if (frontendFingerprint != null && !frontendFingerprint.trim().isEmpty()) {
            return frontendFingerprint.trim();
        }
        
        // Fallback to server-side fingerprint generation
        String userAgent = request.getHeader("User-Agent");
        String remoteAddr = getClientIpAddress(request);
        String acceptLanguage = request.getHeader("Accept-Language");
        String acceptEncoding = request.getHeader("Accept-Encoding");
        
        return singleDeviceLoginService.createDeviceFingerprint(userAgent, remoteAddr, acceptLanguage, acceptEncoding);
    }

    /**
     * Get client IP address from request, handling proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Handle multiple IPs in X-Forwarded-For
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }
        
        return request.getRemoteAddr();
    }
    
     //New endpoint to get fresh cohort data (called after login) with userId
    @GetMapping("/{userId}/cohorts")
    public ResponseEntity<?> getUserCohorts(@PathVariable String userId) {
        logger.debug("Fetching fresh cohort data for user: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        // Validate user exists and is active
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();
        if (!user.isActive()) {
            return buildDeactivatedUserResponse(user);
        }
        
        // Get fresh cohort data
        UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);
        
        response.put("userDetails", userDetailsDTO);
        
     // Add assignment statistics for mentor only
        if ("mentor".equalsIgnoreCase(user.getUserType())) {
            addMentorAssignmentStatistics(response, userDetailsDTO);
        }
        
        // Add cohort end-date reminders for all active cohorts
        addCohortEndDateReminders(response, userDetailsDTO);
        
        // Set headers to prevent caching of cohort data
        HttpServletResponse httpResponse = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getResponse();
        if (httpResponse != null) {
            httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            httpResponse.setHeader("Pragma", "no-cache");
            httpResponse.setHeader("Expires", "0");
        }
        
        return ResponseEntity.ok(response);
    }
    /**
     * Helper method to add mentor assignment statistics to the response
     */
    private void addMentorAssignmentStatistics(Map<String, Object> response,
                                            UserDetailsWithCohortsAndProgramsDTO userDetailsDTO) {
   //     Map<String, Object> assignmentStats = new HashMap<>();
        
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
        
     // Detailed statistics per cohort - using LinkedHashMap to maintain order
        Map<String, Map<String, Object>> cohortStatistics = new LinkedHashMap<>();
        
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
            Map<String, Object> cohortStats = new LinkedHashMap<>();
            cohortStats.put("correctedAssignments", cohortCorrectedAssignments);
            cohortStats.put("totalAssignments", cohortTotalAssignments);
            cohortStats.put("pendingAssignments", cohortPendingAssignments);
            cohortStats.put("cohortUserCount", cohortUserCount);
            
            // Add to cohort statistics map
            cohortStatistics.put(cohortId, cohortStats);
        }
        
        // Create aggregate statistics with proper structure matching the expected JSON
        Map<String, Object> assignmentStats = new LinkedHashMap<>();
        assignmentStats.put("correctedAssignments", totalCorrectedAssignments);
        assignmentStats.put("totalAssignments", totalAssignments);
        assignmentStats.put("pendingAssignments", totalPendingAssignments);
        assignmentStats.put("totalCohortUserCount", totalCohortUserCount);
        assignmentStats.put("cohortDetails", cohortStatistics);
        
        // Add assignment statistics to response
        response.put("assignmentStatistics", assignmentStats);
    }
    
    /**
     * Helper method to add cohort reminders to the response
     */
    private void addCohortEndDateReminders(Map<String, Object> response,
                                        UserDetailsWithCohortsAndProgramsDTO userDetailsDTO) {
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
                            "Your program '%s' ends in %d day(s). Make sure to complete your assignments and activities.",
                            cohort.getCohortName(), daysUntilEnd));
                    } 
                    // Check for cohorts ending today
                    else if (daysUntilEnd == 0) {
                        cohortReminders.add(String.format(
                            "Your program '%s' ends today! Please complete any pending work immediately.",
                            cohort.getCohortName()));
                    }
                    // Check for ended cohorts
                    else if (cohortEndDate.isBefore(nowDateOnly)) {
                        endedCohortReminders.add(String.format(
                            "Your program '%s' has ended on %s. No further activities are possible.",
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
    
     // select-cohort endpoint with better validation
    @PostMapping("/select-cohort")
    public ResponseEntity<?> selectCohort(@RequestBody Map<String, String> cohortData, HttpServletRequest request) {
        String selectedCohortId = cohortData.get("cohortId");
        String userId = cohortData.get("userId");
        logger.info("Select cohort request - userId: {}, cohortId: {}", userId, selectedCohortId);
        
        Map<String, Object> response = new HashMap<>();
        
        // Validate inputs
        if (selectedCohortId == null || selectedCohortId.trim().isEmpty()) {
            response.put("error", "Cohort ID is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        if (userId == null || userId.trim().isEmpty()) {
            response.put("error", "User ID is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Get fresh user data (don't rely on cached data)
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            logger.warn("Select cohort failed - User not found: {}", userId);
            response.put("error", "User not found. Please login again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = userOpt.get();
        
        // Check if user is active
        if (!user.isActive()) {
            logger.warn("Select cohort failed - User account deactivated: {}", userId);
            return buildDeactivatedUserResponse(user);
        }
        
        // Get fresh cohort data (don't rely on cached data)
        Optional<Cohort> cohortOpt = cohortRepository.findById(selectedCohortId);
        if (cohortOpt.isEmpty()) {
            logger.warn("Select cohort failed - Invalid cohort ID: {}", selectedCohortId);
            response.put("error", "Invalid cohort. Please select a valid cohort.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        Cohort selectedCohort = cohortOpt.get();
        
        // Check if user is active in this cohort (fresh check)
        Optional<UserCohortMapping> cohortMapping = userCohortMappingRepository
            .findByUser_UserIdAndCohort_CohortId(userId, selectedCohortId);
        
        if (cohortMapping.isEmpty() || !cohortMapping.get().isActive()) {
            logger.warn("Select cohort failed - User not active in cohort - userId: {}, cohortId: {}", 
                    userId, selectedCohortId);
            return buildCohortAccessDeniedResponse(user, cohortMapping);
        }
        
        // Fresh cohort end date validation
        if (isCohortEndedOrEnding(selectedCohort, response)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
     // ===== SINGLE DEVICE LOGIN LOGIC FOR COHORT SELECTION =====
        if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
            // Extract device fingerprint from request
            String deviceFingerprint = extractDeviceFingerprint(request, cohortData);
            logger.debug("Cohort selection - Device fingerprint for user {}: {}", userId, deviceFingerprint);
            
            // Validate current session device before proceeding
            String currentSessionId = (String) request.getSession().getAttribute("sessionId");
            if (currentSessionId != null) {
                SingleDeviceLoginService.SessionDeviceValidationResult deviceValidation = 
                    singleDeviceLoginService.validateSessionDevice(userId, currentSessionId, deviceFingerprint);
                
                if (!deviceValidation.isValid()) {
                    logger.warn("Cohort selection failed - Device validation failed for user: {}, session: {} - {}", 
                        userId, currentSessionId, deviceValidation.getErrorMessage());
                    response.put("error", deviceValidation.getErrorMessage());
                    response.put("errorCode", deviceValidation.getErrorCode());
                    response.put("requireReauth", true);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            }
            
            // Handle single device login for cohort-specific sessions with device fingerprinting
            SingleDeviceLoginService.SingleDeviceLoginResult singleDeviceResult = 
                singleDeviceLoginService.handleSingleDeviceLogin(userId, selectedCohortId, deviceFingerprint);
            
            if (!singleDeviceResult.isSuccess()) {
                logger.error("Single device login handling failed during cohort selection for user: {} - {}", 
                    userId, singleDeviceResult.getErrorMessage());
                response.put("error", "Session management error during cohort selection. Please try again.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
            if (singleDeviceResult.getTerminatedSessionCount() > 0) {
                logger.info("Cohort selection - terminated {} existing session(s) for user: {}", 
                    singleDeviceResult.getTerminatedSessionCount(), userId);
            }
            
            // Store device fingerprint for session validation
            response.put("deviceFingerprint", deviceFingerprint);
        }
        // ===== END SINGLE DEVICE LOGIN LOGIC =====
        
        // Create session with enhanced validation
        return createEnhancedSessionAndRespond(user, selectedCohort, userId, selectedCohortId, response, request);
    }

    /**
     * Helper method to check if cohort has ended or is ending
     */
    private boolean isCohortEndedOrEnding(Cohort cohort, Map<String, Object> response) {
        OffsetDateTime cohortEndDate = cohort.getCohortEndDate();
        if (cohortEndDate == null) {
            return false; // No end date, cohort is ongoing
        }
        
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime endDateOnly = cohortEndDate.withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        if (endDateOnly.isBefore(nowDateOnly)) {
            String formattedEndDate = cohortEndDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            response.put("error", String.format("This Program has ended on %s. You cannot access this program anymore.", formattedEndDate));
            response.put("errorCode", "COHORT_ENDED");
            return true;
        }
        
        return false;
    }

    /**
     * Enhanced session creation with better error handling
     */
    private ResponseEntity<?> createEnhancedSessionAndRespond(User user, Cohort selectedCohort,
                                                                String userId, String selectedCohortId,
                                                                Map<String, Object> response,
                                                                HttpServletRequest request) {
        try {
            // Invalidate any existing active sessions for this user-cohort combination
            userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
            
            // Create new session
            UserSessionMapping userSession = new UserSessionMapping();
            String newSessionId = UUID.randomUUID().toString();
            userSession.setSessionId(newSessionId);
            userSession.setUser(user);
            userSession.setCohort(selectedCohort);
            userSession.setSessionStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            userSession.setUuid(UUID.randomUUID().toString());
            
            // Save new session
            userSessionMappingService.createUserSessionMapping(userSession);
            
         // ===== REGISTER SINGLE DEVICE SESSION =====
            if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
                // Extract device fingerprint for session registration
                Map<String, String> requestData = new HashMap<>();
                String deviceFingerprint = extractDeviceFingerprint(request, requestData);
                
                singleDeviceLoginService.registerActiveSession(userId, newSessionId, selectedCohortId, deviceFingerprint);
                
                // Store device fingerprint in session for validation filter
                HttpSession httpSession = request.getSession(true);
                httpSession.setAttribute("deviceFingerprint", deviceFingerprint);
            }
            // ===== END REGISTER SINGLE DEVICE SESSION =====
            
            // Update HTTP session attributes
            HttpSession httpSession = request.getSession(true);
            httpSession.setAttribute("userId", userId);
            httpSession.setAttribute("cohortId", selectedCohortId);
            httpSession.setAttribute("sessionId", newSessionId);
            httpSession.setMaxInactiveInterval(30 * 60); // 30 minutes timeout
            
            // Check if it's the final day
            boolean isFinalDay = isCohortFinalDay(selectedCohort);
            String message = isFinalDay 
                ? "Cohort selected successfully. Note: This is the final day of your cohort."
                : "Cohort selected successfully. Welcome to " + selectedCohort.getCohortName() + "!";
         // Add single device login notification if enabled
            if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
                message += " (Single device login active)";
            }
            response.put("message", message);
            response.put("sessionId", newSessionId);
            response.put("cohortId", selectedCohortId);
            response.put("userId", userId);
            response.put("cohortName", selectedCohort.getCohortName());
            response.put("enableAiEvaluation", selectedCohort.isEnableAiEvaluation());
            
            if (isFinalDay) {
                response.put("warning", "FINAL_DAY");
            }
            
         // Add single device login info
            if (singleDeviceLoginService.isSingleDeviceLoginEnabled()) {
                response.put("singleDeviceLogin", true);
                // Include device fingerprint for frontend tracking
                if (response.containsKey("deviceFingerprint")) {
                    // Device fingerprint already added above
                }
            }
            
            logger.info("Enhanced cohort selection successful - userId: {}, cohortId: {}, sessionId: {}", 
                userId, selectedCohortId, newSessionId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating enhanced session for user: {}, cohort: {}", userId, selectedCohortId, e);
            response.put("error", "Unable to create session. Please try again later.");
            response.put("errorCode", "SESSION_CREATE_ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check if cohort is on its final day
     */
    private boolean isCohortFinalDay(Cohort cohort) {
        if (cohort.getCohortEndDate() == null) {
            return false;
        }
        
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime endDateOnly = cohort.getCohortEndDate().withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        return endDateOnly.isEqual(nowDateOnly);
    }

    /**
     * Build response for deactivated user
     */
    private ResponseEntity<?> buildDeactivatedUserResponse(User user) {
        Organization userOrganization = user.getOrganization();
        String adminContactMessage = buildAdminContactMessage(userOrganization);
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("error", "Your account has been deactivated.");
        errorDetails.put("deactivationDetails", user.getDeactivationDetails());
        errorDetails.put("contactInfo", adminContactMessage);
        errorDetails.put("errorCode", "USER_DEACTIVATED");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    /**
     * Build response for cohort access denied
     */
    private ResponseEntity<?> buildCohortAccessDeniedResponse(User user, Optional<UserCohortMapping> cohortMapping) {
        Organization userOrganization = user.getOrganization();
        String adminContactMessage = buildAdminContactMessage(userOrganization);
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("error", "Your access to this program has been deactivated.");
        errorDetails.put("errorCode", "COHORT_ACCESS_DENIED");
        
        if (cohortMapping.isPresent()) {
            errorDetails.put("deactivationDetails", cohortMapping.get().getDeactivationDetails());
        }
        
        errorDetails.put("contactInfo", adminContactMessage);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    /**
     * Build admin contact message
     */
    private String buildAdminContactMessage(Organization organization) {
        if (organization != null) {
            String adminName = organization.getOrganizationAdminName();
            String adminEmail = organization.getOrganizationAdminEmail();
            String adminPhone = organization.getOrganizationAdminPhone();
            
            return String.format(
                " Please contact %s at %s or %s for help.",
                adminName != null ? adminName : "your administrator",
                adminEmail != null ? adminEmail : "email not available",
                adminPhone != null ? adminPhone : "phone not available"
            );
        } else {
            return " Please contact your administrator for help.";
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            HttpSession httpSession = request.getSession(false);
            String sessionId = null;
            String userId = null;
            String cohortId = null;

            if (httpSession != null) {
                sessionId = (String) httpSession.getAttribute("sessionId");
                userId = (String) httpSession.getAttribute("userId");
                cohortId = (String) httpSession.getAttribute("cohortId");

                // Update the session end timestamp
                if (sessionId != null) {
                    Optional<UserSessionMapping> sessionOpt = userSessionMappingService.getUserSessionMappingById(sessionId);
                    if (sessionOpt.isPresent()) {
                        UserSessionMapping userSession = sessionOpt.get();
                        userSession.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
                        userSessionMappingService.updateUserSessionMapping(sessionId, userSession);
                        logger.info("Session ended manually by logout - sessionId: {}, userId: {}", sessionId, userId);
                    }
                }

                // Clear all related caches
                if (userId != null && cohortId != null && sessionId != null) {
                    sessionValidationFilter.evictUserSessionCaches(userId, cohortId, sessionId);
                }

                // Invalidate the HTTP session
                httpSession.invalidate();
            }

            response.put("message", "Logout successful");
            response.put("status", "success");
            response.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error during logout process", e);
            response.put("message", "Logout completed with warnings");
            response.put("status", "warning");
            response.put("error", "Some cleanup operations may not have completed properly");
            return ResponseEntity.ok(response);
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
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        logger.info("Received request to update user: {}", id);

        try {
            // Check for deactivation reason when status is being set to DISABLED
            if (user.getStatus() != null && "DISABLED".equals(user.getStatus())) {
                if (user.getDeactivatedReason() == null || user.getDeactivatedReason().trim().isEmpty()) {
                    logger.error("Deactivation reason is required when disabling a user");
                    response.put("success", false);
                    response.put("message", "Deactivation reason is required when disabling a user");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            }

            User updatedUser = userService.updateUser(id, user);

            response.put("success", true);

            // Provide specific messages for status changes
            if (user.getStatus() != null) {
                if ("DISABLED".equals(user.getStatus())) {
                    response.put("message", "User has been deactivated successfully along with all associated cohort mappings");
                    logger.info("User {} has been deactivated with reason: {}", id, user.getDeactivatedReason());
                } else if ("ACTIVE".equals(user.getStatus())) {
                    response.put("message", "User has been activated successfully. Note: This does not reactivate cohort mappings.");
                    logger.info("User {} has been activated", id);
                } else {
                    response.put("message", "User updated successfully");
                }
            } else {
                response.put("message", "User updated successfully");
            }

            response.put("data", updatedUser);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating user {}: {}", id, e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error updating user {}: {}", id, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
//    @PostMapping("/signin")
//    public ResponseEntity<?> signin(@RequestBody Map<String, String> loginData) {
//        String userId = loginData.get("userId");
//        String userPassword = loginData.get("userPassword");
//        String expectedUserType = loginData.get("userType");
//        logger.debug("Login attempt - userId: {}, userType: {}", userId, expectedUserType);
//        // Debug logging
//        System.out.println("Received userId: " + userId);
//        System.out.println("Received password: " + userPassword);
//        System.out.println("Received userType: " + expectedUserType);
//        
//        // Initialize response map
//        Map<String, Object> response = new HashMap<>();
//        
//     // Check if required fields are provided
//        if (userId == null || userPassword == null || expectedUserType == null) {
//            response.put("error", "User ID, password, and user type are required");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Perform a case-sensitive lookup in the database
//        Optional<User> userOpt = userRepository.findByUserId(userId);
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
//                UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);
//
//                response.put("message", "Successfully logged in as " + user.getUserType() + ".");
//                response.put("userType", user.getUserType());
//                response.put("userDetails", userDetailsDTO);
//                
//                // Add assignment statistics for mentor login only
//                if ("mentor".equalsIgnoreCase(user.getUserType())) {
//                    Map<String, Object> assignmentStats = new HashMap<>();
//                    
//                    // Get all cohorts associated with this mentor
//                    List<String> mentorCohortIds = new ArrayList<>();
//                    if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//                        for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                            mentorCohortIds.add(cohort.getCohortId());
//                        }
//                    }
//                    
//                    // Aggregated statistics across all mentor's cohorts
//                    int totalCohortUserCount = 0;
//                    int totalAssignments = 0;
//                    int totalCorrectedAssignments = 0;
//                    int totalPendingAssignments = 0;
//                    
//                    // Detailed statistics per cohort
//                    Map<String, Map<String, Object>> cohortStatistics = new HashMap<>();
//                    
//                    // Calculate statistics for each cohort
//                    for (String cohortId : mentorCohortIds) {
//                        // Get user count for this cohort
//                        int cohortUserCount = getUserCountInCohort(cohortId);
//                        totalCohortUserCount += cohortUserCount;
//                        
//                        // Get assignments for this cohort
//                        List<UserAssignment> assignments = userAssignmentService.getAssignmentsByCohortId(cohortId);
//                        int cohortTotalAssignments = assignments.size();
//                        totalAssignments += cohortTotalAssignments;
//                        
//                        // Count corrected vs pending assignments
//                        int cohortCorrectedAssignments = 0;
//                        int cohortPendingAssignments = 0;
//                        
//                        for (UserAssignment assignment : assignments) {
//                            if (assignment.getCorrectedDate() != null) {
//                                cohortCorrectedAssignments++;
//                                totalCorrectedAssignments++;
//                            } else {
//                                cohortPendingAssignments++;
//                                totalPendingAssignments++;
//                            }
//                        }
//                        
//                        // Store cohort-specific statistics
//                        Map<String, Object> cohortStats = new HashMap<>();
//                        cohortStats.put("cohortUserCount", cohortUserCount);
//                        cohortStats.put("totalAssignments", cohortTotalAssignments);
//                        cohortStats.put("correctedAssignments", cohortCorrectedAssignments);
//                        cohortStats.put("pendingAssignments", cohortPendingAssignments);
//                        
//                        // Add to cohort statistics map
//                        cohortStatistics.put(cohortId, cohortStats);
//                    }
//                    
//                    // Create aggregate statistics
//                    assignmentStats.put("totalCohortUserCount", totalCohortUserCount);
//                    assignmentStats.put("totalAssignments", totalAssignments);
//                    assignmentStats.put("correctedAssignments", totalCorrectedAssignments);
//                    assignmentStats.put("pendingAssignments", totalPendingAssignments);
//                    assignmentStats.put("cohortDetails", cohortStatistics);
//                    
//                    // Add assignment statistics to response
//                    response.put("assignmentStatistics", assignmentStats);
//                }
//
//                // Add cohort end-date reminders for all active cohorts
//                List<String> cohortReminders = new ArrayList<>();
//                List<String> endedCohortReminders = new ArrayList<>();
//                
//                OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
//                OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
//
//                if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//                    for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                        if (cohort.getCohortEndDate() != null) {
//                            OffsetDateTime cohortEndDate = cohort.getCohortEndDate().truncatedTo(ChronoUnit.DAYS);
//                            long daysUntilEnd = ChronoUnit.DAYS.between(nowDateOnly, cohortEndDate);
//
//                            // Check for upcoming end dates
//                            if (daysUntilEnd > 0 && daysUntilEnd <= 15) {
//                                cohortReminders.add(String.format(
//                                    "Your cohort '%s' ends in %d day(s). Make sure to complete your assignments and activities.",
//                                    cohort.getCohortName(), daysUntilEnd));
//                            } 
//                            // Check for cohorts ending today
//                            else if (daysUntilEnd == 0) {
//                                cohortReminders.add(String.format(
//                                    "Your cohort '%s' ends today! Please complete any pending work immediately.",
//                                    cohort.getCohortName()));
//                            }
//                            // Check for ended cohorts
//                            else if (cohortEndDate.isBefore(nowDateOnly)) {
//                                endedCohortReminders.add(String.format(
//                                    "Your cohort '%s' has ended on %s. No further activities are possible.",
//                                    cohort.getCohortName(), 
//                                    cohort.getCohortEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
//                            }
//                        }
//                    }
//                    
//                    // Add reminders to response
//                    if (!cohortReminders.isEmpty()) {
//                        response.put("cohortReminders", cohortReminders);
//                    }
//                    
//                    // Add ended cohort reminders to response
//                    if (!endedCohortReminders.isEmpty()) {
//                        response.put("endedCohortReminders", endedCohortReminders);
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
//
//    /**
//     * Helper method to get the count of users in a cohort
//     * @param cohortId the ID of the cohort
//     * @return the number of users in the cohort
//     */
//    private int getUserCountInCohort(String cohortId) {
//        // Use a repository method to get the count
//        return userCohortMappingRepository.countByCohortCohortId(cohortId);
//    }
//    
//    @PostMapping("/select-cohort")
//    public ResponseEntity<?> selectCohort(@RequestBody Map<String, String> cohortData) {
//        // Get values from request body
//        String selectedCohortId = cohortData.get("cohortId");
//        String userId = cohortData.get("userId");
//        logger.info("Request userId: {}", userId);
//        
//        Map<String, Object> response = new HashMap<>();
//        
//        
//        // Validate cohortId
//        if (selectedCohortId == null || selectedCohortId.trim().isEmpty()) {
//            response.put("error", "CohortId is required");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Fetch user and validate cohort assignment
//        Optional<User> userOpt = userRepository.findByUserId(userId);
//        if (!userOpt.isPresent()) {
//            response.put("error", "User not found");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        User user = userOpt.get();
//        
//        // Fetch user's cohorts to validate if the selected cohort is assigned to the user
//        UserDetailsWithCohortsAndProgramsDTO userDetails = 
//            userService.getUserDetailsWithCohortsAndPrograms(userId);
//        
//        boolean cohortFound = false;
//        if (userDetails.getAllCohortsWithPrograms() != null) {
//            cohortFound = userDetails.getAllCohortsWithPrograms().stream()
//                .anyMatch(cohort -> cohort.getCohortId().equals(selectedCohortId));
//        }
//        
//        if (!cohortFound) {
//            response.put("error", "Selected cohort is not assigned to the user");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Fetch cohort
//        Optional<Cohort> cohortOpt = cohortRepository.findById(selectedCohortId);
//        if (!cohortOpt.isPresent()) {
//            response.put("error", "Invalid cohort");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        Cohort selectedCohort = cohortOpt.get();
//
//     // Check if cohort end date is today or in the past
//     OffsetDateTime cohortEndDate = selectedCohort.getCohortEndDate();
//     OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
//     
//     // Truncate both dates to remove time components
//     OffsetDateTime endDateOnly = cohortEndDate != null 
//         ? cohortEndDate.withHour(0).withMinute(0).withSecond(0).withNano(0)
//         : null;
//     OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
//        
//  // If cohort end date is null, proceed with selection
//     if (cohortEndDate == null) {
//         // Proceed with cohort selection
//         try {
//             // Check for existing active sessions
//             userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
//             
//             // Create new session
//             UserSessionMapping userSession = new UserSessionMapping();
//             String newSessionId = UUID.randomUUID().toString();
//             userSession.setSessionId(newSessionId);
//             userSession.setUser(user);
//             userSession.setCohort(selectedCohort);
//             userSession.setSessionStartTimestamp(now);
//             userSession.setUuid(UUID.randomUUID().toString());
//             
//             // Save new session
//             userSessionMappingService.createUserSessionMapping(userSession);
//             
//             // Update session attributes
//             session.setAttribute("userId", userId);
//             session.setAttribute("cohortId", selectedCohortId);
//             session.setAttribute("sessionId", newSessionId);
//        
//             response.put("message", "Cohort selected successfully");
//             response.put("sessionId", newSessionId);
//             response.put("cohortId", selectedCohortId);
//             response.put("userId", userId);
//             
//             return ResponseEntity.ok(response);
//             
//         } catch (Exception e) {
//             response.put("error", "Error creating session: " + e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//         }
//     }
//
//     // Check if cohort end date is exactly today
//     if (endDateOnly.isEqual(nowDateOnly)) {
//         // Cohort is ending today, allow selection
//         try {
//             // Check for existing active sessions
//             userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
//             
//             // Create new session
//             UserSessionMapping userSession = new UserSessionMapping();
//             String newSessionId = UUID.randomUUID().toString();
//             userSession.setSessionId(newSessionId);
//             userSession.setUser(user);
//             userSession.setCohort(selectedCohort);
//             userSession.setSessionStartTimestamp(now);
//             userSession.setUuid(UUID.randomUUID().toString());
//             
//             // Save new session
//             userSessionMappingService.createUserSessionMapping(userSession);
//             
//             // Update session attributes
//             session.setAttribute("userId", userId);
//             session.setAttribute("cohortId", selectedCohortId);
//             session.setAttribute("sessionId", newSessionId);
//        
//             response.put("message", "Cohort selected successfully on its final day");
//             response.put("sessionId", newSessionId);
//             response.put("cohortId", selectedCohortId);
//             response.put("userId", userId);
//             
//             return ResponseEntity.ok(response);
//             
//         } catch (Exception e) {
//             response.put("error", "Error creating session: " + e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//         }
//     }
//
//     // Check if cohort end date has passed
//     if (endDateOnly.isBefore(nowDateOnly)) {
//         // Cohort has ended
//         response.put("error", String.format("This cohort has ended on %s. You cannot select this cohort.", 
//             cohortEndDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//     }
//
//     // If cohort end date is in the future, proceed with selection
//     try {
//         // Check for existing active sessions
//         userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
//         
//         // Create new session
//         UserSessionMapping userSession = new UserSessionMapping();
//         String newSessionId = UUID.randomUUID().toString();
//         userSession.setSessionId(newSessionId);
//         userSession.setUser(user);
//         userSession.setCohort(selectedCohort);
//         userSession.setSessionStartTimestamp(now);
//         userSession.setUuid(UUID.randomUUID().toString());
//         
//         // Save new session
//         userSessionMappingService.createUserSessionMapping(userSession);
//         
//         // Update session attributes
//         session.setAttribute("userId", userId);
//         session.setAttribute("cohortId", selectedCohortId);
//         session.setAttribute("sessionId", newSessionId);
//    
//         response.put("message", "Cohort selected successfully");
//         response.put("sessionId", newSessionId);
//         response.put("cohortId", selectedCohortId);
//         response.put("userId", userId);
//         
//         return ResponseEntity.ok(response);
//         
//     } catch (Exception e) {
//         response.put("error", "Error creating session: " + e.getMessage());
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//     }
// }
    
    
//    @PostMapping("/signin")
//    public ResponseEntity<?> signin(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
//        String userId = loginData.get("userId");
//        String userPassword = loginData.get("userPassword");
//        String expectedUserType = loginData.get("userType");
//        
//        logger.debug("Login attempt - userId: {}, userType: {}", userId, expectedUserType);
//        
//        // Initialize response map
//        Map<String, Object> response = new HashMap<>();
//        
//        // Check if required fields are provided
//        if (userId == null || userPassword == null || expectedUserType == null) {
//            response.put("error", "User ID, password, and user type are required");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Perform a case-sensitive lookup in the database
//        Optional<User> userOpt = userRepository.findByUserId(userId);
//
//        if (userOpt.isEmpty()) {
//            logger.debug("Login failed - User ID not found: {}", userId);
//            response.put("error", "Oops! Invalid userId");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//        
//        User user = userOpt.get();
//        
//     // Check if user is active - IMPLEMENTED CHECK
//        if (!user.isActive()) {
//            logger.debug("Login failed - User account deactivated: {}", userId);
//
//            // Get organization admin contact details
//            Organization userOrganization = user.getOrganization();
//            String adminContactMessage;
//
//            if (userOrganization != null) {
//                String adminName = userOrganization.getOrganizationAdminName();
//                String adminEmail = userOrganization.getOrganizationAdminEmail();
//                String adminPhone = userOrganization.getOrganizationAdminPhone();
//
//                adminContactMessage = String.format(
//                    " Please contact %s at %s or %s for help.",
//                    adminName != null ? adminName : "your administrator",
//                    adminEmail != null ? adminEmail : "email not available",
//                    adminPhone != null ? adminPhone : "phone not available"
//                );
//            } else {
//                adminContactMessage = " Please contact your administrator for help.";
//            }
//
//            Map<String, Object> errorDetails = new HashMap<>();
//            errorDetails.put("error", "Your account has been deactivated.");
//            errorDetails.put("deactivationDetails", user.getDeactivationDetails());
//            errorDetails.put("contactInfo", adminContactMessage);
//            
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
//        }
//
//        // Validate exact case-sensitive userId
//        if (!user.getUserId().equals(userId)) {
//            logger.debug("Login failed - Case mismatch for userId: {} vs {}", userId, user.getUserId());
//            response.put("error", "Oops! User ID not found. Please check the User ID");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//        
//        // Check user type
//        if (!user.getUserType().equalsIgnoreCase(expectedUserType)) {
//            logger.debug("Login failed - User type mismatch for {}: expected {}, found {}", 
//                    userId, expectedUserType, user.getUserType());
//            response.put("error", "Invalid user type. Please ensure you're logging in with the correct user type.");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//
//     // Verify password
//        if (!userService.verifyPassword(userPassword, user.getUserPassword())) {
//            logger.debug("Login failed - Invalid password for user: {}", userId);
//            response.put("error", "Oops! Invalid userpassword");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//        
//        // Authentication successful - proceed with creating response
//        logger.info("Successful login - User: {}, Type: {}", userId, user.getUserType());
//        UserDetailsWithCohortsAndProgramsDTO userDetailsDTO = userService.getUserDetailsWithCohortsAndPrograms(userId);
//
//        response.put("message", "Successfully logged in as " + user.getUserType() + ".");
//        response.put("userType", user.getUserType());
//        response.put("userDetails", userDetailsDTO);
//        
//        // Add assignment statistics for mentor login only
//        if ("mentor".equalsIgnoreCase(user.getUserType())) {
//            addMentorAssignmentStatistics(response, userDetailsDTO);
//        }
//
//        // Add cohort end-date reminders for all active cohorts
//        addCohortEndDateReminders(response, userDetailsDTO);
//        
//        return ResponseEntity.ok(response);
//    }
//    
//    /**
//     * Helper method to add mentor assignment statistics to the response
//     */
//    private void addMentorAssignmentStatistics(Map<String, Object> response, 
//                                              UserDetailsWithCohortsAndProgramsDTO userDetailsDTO) {
//        Map<String, Object> assignmentStats = new HashMap<>();
//        
//        // Get all cohorts associated with this mentor
//        List<String> mentorCohortIds = new ArrayList<>();
//        if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//            for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                mentorCohortIds.add(cohort.getCohortId());
//            }
//        }
//        
//        // Aggregated statistics across all mentor's cohorts
//        int totalCohortUserCount = 0;
//        int totalAssignments = 0;
//        int totalCorrectedAssignments = 0;
//        int totalPendingAssignments = 0;
//        
//        // Detailed statistics per cohort
//        Map<String, Map<String, Object>> cohortStatistics = new HashMap<>();
//        
//        // Calculate statistics for each cohort
//        for (String cohortId : mentorCohortIds) {
//            // Get user count for this cohort
//            int cohortUserCount = getUserCountInCohort(cohortId);
//            totalCohortUserCount += cohortUserCount;
//            
//            // Get assignments for this cohort
//            List<UserAssignment> assignments = userAssignmentService.getAssignmentsByCohortId(cohortId);
//            int cohortTotalAssignments = assignments.size();
//            totalAssignments += cohortTotalAssignments;
//            
//            // Count corrected vs pending assignments
//            int cohortCorrectedAssignments = 0;
//            int cohortPendingAssignments = 0;
//            
//            for (UserAssignment assignment : assignments) {
//                if (assignment.getCorrectedDate() != null) {
//                    cohortCorrectedAssignments++;
//                    totalCorrectedAssignments++;
//                } else {
//                    cohortPendingAssignments++;
//                    totalPendingAssignments++;
//                }
//            }
//            
//            // Store cohort-specific statistics
//            Map<String, Object> cohortStats = new HashMap<>();
//            cohortStats.put("cohortUserCount", cohortUserCount);
//            cohortStats.put("totalAssignments", cohortTotalAssignments);
//            cohortStats.put("correctedAssignments", cohortCorrectedAssignments);
//            cohortStats.put("pendingAssignments", cohortPendingAssignments);
//            
//            // Add to cohort statistics map
//            cohortStatistics.put(cohortId, cohortStats);
//        }
//        
//        // Create aggregate statistics
//        assignmentStats.put("totalCohortUserCount", totalCohortUserCount);
//        assignmentStats.put("totalAssignments", totalAssignments);
//        assignmentStats.put("correctedAssignments", totalCorrectedAssignments);
//        assignmentStats.put("pendingAssignments", totalPendingAssignments);
//        assignmentStats.put("cohortDetails", cohortStatistics);
//        
//        // Add assignment statistics to response
//        response.put("assignmentStatistics", assignmentStats);
//    }
//    
//    /**
//     * Helper method to add cohort reminders to the response
//     */
//    private void addCohortEndDateReminders(Map<String, Object> response, 
//                                          UserDetailsWithCohortsAndProgramsDTO userDetailsDTO) {
//        List<String> cohortReminders = new ArrayList<>();
//        List<String> endedCohortReminders = new ArrayList<>();
//        
//        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
//        OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
//
//        if (userDetailsDTO.getAllCohortsWithPrograms() != null) {
//            for (CohortProgramDTO cohort : userDetailsDTO.getAllCohortsWithPrograms()) {
//                if (cohort.getCohortEndDate() != null) {
//                    OffsetDateTime cohortEndDate = cohort.getCohortEndDate().truncatedTo(ChronoUnit.DAYS);
//                    long daysUntilEnd = ChronoUnit.DAYS.between(nowDateOnly, cohortEndDate);
//
//                    // Check for upcoming end dates
//                    if (daysUntilEnd > 0 && daysUntilEnd <= 15) {
//                        cohortReminders.add(String.format(
//                            "Your cohort '%s' ends in %d day(s). Make sure to complete your assignments and activities.",
//                            cohort.getCohortName(), daysUntilEnd));
//                    } 
//                    // Check for cohorts ending today
//                    else if (daysUntilEnd == 0) {
//                        cohortReminders.add(String.format(
//                            "Your cohort '%s' ends today! Please complete any pending work immediately.",
//                            cohort.getCohortName()));
//                    }
//                    // Check for ended cohorts
//                    else if (cohortEndDate.isBefore(nowDateOnly)) {
//                        endedCohortReminders.add(String.format(
//                            "Your cohort '%s' has ended on %s. No further activities are possible.",
//                            cohort.getCohortName(), 
//                            cohort.getCohortEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
//                    }
//                }
//            }
//            
//            // Add reminders to response
//            if (!cohortReminders.isEmpty()) {
//                response.put("cohortReminders", cohortReminders);
//            }
//            
//            // Add ended cohort reminders to response
//            if (!endedCohortReminders.isEmpty()) {
//                response.put("endedCohortReminders", endedCohortReminders);
//            }
//        }
//    }
//
//    /**
//     * Helper method to get the count of users in a cohort
//     * @param cohortId the ID of the cohort
//     * @return the number of users in the cohort
//     */
//    private int getUserCountInCohort(String cohortId) {
//        // Use a repository method to get the count
//        return userCohortMappingRepository.countByCohortCohortId(cohortId);
//    }
//    
//    @PostMapping("/select-cohort")
//    public ResponseEntity<?> selectCohort(@RequestBody Map<String, String> cohortData) {
//        // Get values from request body
//        String selectedCohortId = cohortData.get("cohortId");
//        String userId = cohortData.get("userId");
//        logger.info("Select cohort request - userId: {}, cohortId: {}", userId, selectedCohortId);
//        
//        Map<String, Object> response = new HashMap<>();
//        
//        // Validate inputs
//        if (selectedCohortId == null || selectedCohortId.trim().isEmpty()) {
//            response.put("error", "Cohort ID is required");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        if (userId == null || userId.trim().isEmpty()) {
//            response.put("error", "User ID is required");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Fetch user
//        Optional<User> userOpt = userRepository.findByUserId(userId);
//        if (userOpt.isEmpty()) {
//            logger.warn("Select cohort failed - User not found: {}", userId);
//            response.put("error", "User not found. Please check the user ID and try again.");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        User user = userOpt.get();
//        
//        // Check if user is active
//        if (!user.isActive()) {
//            logger.warn("Select cohort failed - User cohort deactivated: {}", userId);
//         // Get organization admin contact details
//            Organization userOrganization = user.getOrganization();
//            String adminContactMessage;
//            if (userOrganization != null) {
//                String adminName = userOrganization.getOrganizationAdminName();
//                String adminEmail = userOrganization.getOrganizationAdminEmail();
//                String adminPhone = userOrganization.getOrganizationAdminPhone();
//                
//                adminContactMessage = String.format(
//                        " Please contact %s at %s or %s for help.",
//                        adminName != null ? adminName : "your administrator",
//                        adminEmail != null ? adminEmail : "email not available",
//                        adminPhone != null ? adminPhone : "phone not available"
//                    );
//                } else {
//                    adminContactMessage = " Please contact your administrator for help.";
//                }
//            
//            Map<String, Object> errorDetails = new HashMap<>();
//            errorDetails.put("error", "Your account has been deactivated.");
//            errorDetails.put("deactivationDetails", user.getDeactivationDetails());
//            errorDetails.put("contactInfo", adminContactMessage);
//            
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
//        }
//        
//        // Check if user is active in this cohort - IMPLEMENTED CHECK
//        Optional<UserCohortMapping> cohortMapping = userCohortMappingRepository
//            .findByUser_UserIdAndCohort_CohortId(userId, selectedCohortId);
//        
//        if (cohortMapping.isEmpty() || !cohortMapping.get().isActive()) {
//            logger.warn("Select cohort failed - User not active in cohort - userId: {}, cohortId: {}", 
//                    userId, selectedCohortId);
//         // Get organization admin contact details for cohort access issue
//            Organization userOrganization = user.getOrganization();
//            String adminContactMessage;
//            if (userOrganization != null) {
//                String adminName = userOrganization.getOrganizationAdminName();
//                String adminEmail = userOrganization.getOrganizationAdminEmail();
//                String adminPhone = userOrganization.getOrganizationAdminPhone();
//                
//                adminContactMessage = String.format(
//                        " Please contact %s at %s or %s for help.",
//                        adminName != null ? adminName : "your administrator",
//                        adminEmail != null ? adminEmail : "email not available",
//                        adminPhone != null ? adminPhone : "phone not available"
//                    );
//                } else {
//                    adminContactMessage = " Please contact your administrator for help.";
//                }
//            
//            Map<String, Object> errorDetails = new HashMap<>();
//            errorDetails.put("error", "Your access to this program has been deactivated.");
//            
//            if (cohortMapping.isPresent()) {
//                errorDetails.put("deactivationDetails", 
//                    cohortMapping.get().getDeactivationDetails());
//            }
//            
//            errorDetails.put("contactInfo", adminContactMessage);
//            
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
//        }
//        
//        // Fetch user's cohorts to validate if the selected cohort is assigned to the user
//        UserDetailsWithCohortsAndProgramsDTO userDetails = 
//            userService.getUserDetailsWithCohortsAndPrograms(userId);
//        
//        boolean cohortFound = false;
//        if (userDetails.getAllCohortsWithPrograms() != null) {
//            cohortFound = userDetails.getAllCohortsWithPrograms().stream()
//                .anyMatch(cohort -> cohort.getCohortId().equals(selectedCohortId));
//        }
//        
//        if (!cohortFound) {
//            logger.warn("Select cohort failed - Cohort not assigned to user - userId: {}, cohortId: {}", 
//                    userId, selectedCohortId);
//            response.put("error", "Selected cohort is not assigned to your account. Please select a valid cohort.");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        // Fetch cohort
//        Optional<Cohort> cohortOpt = cohortRepository.findById(selectedCohortId);
//        if (cohortOpt.isEmpty()) {
//            logger.warn("Select cohort failed - Invalid cohort ID: {}", selectedCohortId);
//            response.put("error", "Invalid cohort. Please select a valid cohort.");
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//        
//        Cohort selectedCohort = cohortOpt.get();
//
//        // Check cohort end date
//        OffsetDateTime cohortEndDate = selectedCohort.getCohortEndDate();
//        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
//         
//        // Truncate both dates to remove time components
//        OffsetDateTime endDateOnly = cohortEndDate != null 
//            ? cohortEndDate.withHour(0).withMinute(0).withSecond(0).withNano(0)
//            : null;
//        OffsetDateTime nowDateOnly = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
//            
//        // If cohort end date is null, proceed with selection
//        if (cohortEndDate == null) {
//            return createSessionAndRespond(user, selectedCohort, userId, selectedCohortId, response);
//        }
//
//        // Check if cohort end date is exactly today
//        if (endDateOnly.isEqual(nowDateOnly)) {
//            logger.info("User selecting cohort on its final day - userId: {}, cohortId: {}", 
//                    userId, selectedCohortId);
//            return createSessionAndRespond(user, selectedCohort, userId, selectedCohortId, response, true);
//        }
//
//        // Check if cohort end date has passed
//        if (endDateOnly.isBefore(nowDateOnly)) {
//            // Cohort has ended
//            String formattedEndDate = cohortEndDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
//            logger.warn("Select cohort failed - Cohort has ended on {} - userId: {}, cohortId: {}", 
//                    formattedEndDate, userId, selectedCohortId);
//            response.put("error", String.format("This cohort has ended on %s. You cannot access this cohort anymore.", 
//                formattedEndDate));
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//
//        // If cohort end date is in the future, proceed with selection
//        return createSessionAndRespond(user, selectedCohort, userId, selectedCohortId, response);
//    }
//    
//    /**
//     * Helper method to create a session and respond to the client
//     */
//    private ResponseEntity<?> createSessionAndRespond(User user, Cohort selectedCohort, 
//                                                     String userId, String selectedCohortId, 
//                                                     Map<String, Object> response) {
//        return createSessionAndRespond(user, selectedCohort, userId, selectedCohortId, response, false);
//    }
//    
//    /**
//     * Helper method to create a session and respond to the client with optional final day message
//     */
//    private ResponseEntity<?> createSessionAndRespond(User user, Cohort selectedCohort, 
//                                                     String userId, String selectedCohortId, 
//                                                     Map<String, Object> response, boolean isFinalDay) {
//        try {
//            // Check for existing active sessions
//            userSessionMappingService.invalidateAllActiveSessions(userId, selectedCohortId);
//            
//            // Create new session
//            UserSessionMapping userSession = new UserSessionMapping();
//            String newSessionId = UUID.randomUUID().toString();
//            userSession.setSessionId(newSessionId);
//            userSession.setUser(user);
//            userSession.setCohort(selectedCohort);
//            userSession.setSessionStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
//            userSession.setUuid(UUID.randomUUID().toString());
//            
//            // Save new session
//            userSessionMappingService.createUserSessionMapping(userSession);
//            
//            // Update session attributes
//            session.setAttribute("userId", userId);
//            session.setAttribute("cohortId", selectedCohortId);
//            session.setAttribute("sessionId", newSessionId);
//        
//            // Create appropriate message
//            String message = isFinalDay 
//                ? "Cohort selected successfully. Note: This is the final day of your cohort."
//                : "Cohort selected successfully. Welcome to " + selectedCohort.getCohortName() + "!";
//                
//            response.put("message", message);
//            response.put("sessionId", newSessionId);
//            response.put("cohortId", selectedCohortId);
//            response.put("userId", userId);
//            
//            logger.info("Cohort selection successful - userId: {}, cohortId: {}, sessionId: {}", 
//                userId, selectedCohortId, newSessionId);
//            
//            return ResponseEntity.ok(response);
//            
//        } catch (Exception e) {
//            logger.error("Error creating session for user: {}, cohort: {}", userId, selectedCohortId, e);
//            response.put("error", "Unable to create session. Please try again later.");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
            


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
  
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable("id") String userId) {
        Map<String, Object> response = new HashMap<>();
        logger.info("Request to deactivate user: {}", userId);
        
        try {
            String message = userService.deactivateUser(userId);
            logger.info("User successfully deactivated: {}", userId);
            response.put("message", message);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to deactivate user: {}, reason: {}", userId, e.getMessage());
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error deactivating user: {}", userId, e);
            response.put("error", "An unexpected error occurred. Please try again later.");
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/{userId}/cohorts/{cohortId}/deactivate")
    public ResponseEntity<?> deactivateUserFromCohort(
            @PathVariable String userId, 
            @PathVariable String cohortId) {
        Map<String, Object> response = new HashMap<>();
        logger.info("Request to deactivate user: {} from cohort: {}", userId, cohortId);
        
        try {
            String message = userService.deactivateUserFromCohort(userId, cohortId);
            logger.info("User successfully deactivated from cohort - userId: {}, cohortId: {}", userId, cohortId);
            response.put("message", message);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to deactivate user from cohort - userId: {}, cohortId: {}, reason: {}", 
                    userId, cohortId, e.getMessage());
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error deactivating user from cohort - userId: {}, cohortId: {}", 
                    userId, cohortId, e);
            response.put("error", "An unexpected error occurred. Please try again later.");
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable("id") String userId) {
        Map<String, Object> response = new HashMap<>();
        logger.info("Request to reactivate user: {}", userId);
        
        try {
            String message = userService.reactivateUser(userId);
            logger.info("User successfully reactivated: {}", userId);
            response.put("message", message);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to reactivate user: {}, reason: {}", userId, e.getMessage());
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error reactivating user: {}", userId, e);
            response.put("error", "An unexpected error occurred. Please try again later.");
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/{userId}/cohorts/{cohortId}/reactivate")
    public ResponseEntity<?> reactivateUserInCohort(
            @PathVariable String userId, 
            @PathVariable String cohortId) {
        Map<String, Object> response = new HashMap<>();
        logger.info("Request to reactivate user: {} in cohort: {}", userId, cohortId);
        
        try {
            String message = userService.reactivateUserInCohort(userId, cohortId);
            logger.info("User successfully reactivated in cohort - userId: {}, cohortId: {}", userId, cohortId);
            response.put("message", message);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to reactivate user in cohort - userId: {}, cohortId: {}, reason: {}", 
                    userId, cohortId, e.getMessage());
            response.put("error", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error reactivating user in cohort - userId: {}, cohortId: {}", 
                    userId, cohortId, e);
            response.put("error", "An unexpected error occurred. Please try again later.");
            response.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    } 
}