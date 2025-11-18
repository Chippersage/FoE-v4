package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import com.FlowofEnglish.dto.*;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserSessionMappingServiceImpl implements UserSessionMappingService {

	@Autowired
    private UserSessionMappingRepository userSessionMappingRepository;
    
    @Autowired
    private CohortRepository cohortRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CohortProgramRepository cohortProgramRepository;
    
    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(UserSessionMappingServiceImpl.class);

    @Override
    public List<UserSessionMapping> getAllUserSessionMappings() {
        return userSessionMappingRepository.findAll();
    }

    @Override
    public Optional<UserSessionMapping> getUserSessionMappingById(String sessionId) {
        return userSessionMappingRepository.findById(sessionId);
    }
    
    @Override
    public List<UserSessionMapping> getUserSessionMappingsByUserId(String userId) {
        return userSessionMappingRepository.findByUser_UserId(userId);
    }

    @Override
    public List<UserSessionMapping> findActiveSessionsByUserIdAndCohortId(String userId, String cohortId) {
        // This should return all active sessions for the given userId and cohortId
        return userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(userId, cohortId);
    }
    
    @Override
    public List<UserSessionMapping> findActiveSessionsForCleanup() {
        return userSessionMappingRepository.findBySessionEndTimestampIsNull();
    }
    
    @Override
    public void invalidateSession(String sessionId) {
        Optional<UserSessionMapping> sessionOpt = userSessionMappingRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionMapping session = sessionOpt.get();
            session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            userSessionMappingRepository.save(session);
        }
    }
    
    @Override
    public void invalidateAllActiveSessions(String userId, String cohortId) {
        List<UserSessionMapping> activeSessions = findActiveSessionsByUserIdAndCohortId(userId, cohortId);
        for (UserSessionMapping session : activeSessions) {
            session.setSessionEndTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
            userSessionMappingRepository.save(session);
        }
    }
    
    @Override
    public UserSessionMapping createUserSessionMapping(UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.save(userSessionMapping);
    }

    @Override
    public Optional<UserSessionMapping> findBySessionId(String sessionId) {
        return userSessionMappingRepository.findBySessionId(sessionId);
    }
    
    @Override
    public UserSessionMapping updateUserSessionMapping(String sessionId, UserSessionMapping userSessionMapping) {
        return userSessionMappingRepository.findById(sessionId).map(existingMapping -> {
            existingMapping.setSessionEndTimestamp(userSessionMapping.getSessionEndTimestamp());
            existingMapping.setSessionStartTimestamp(userSessionMapping.getSessionStartTimestamp());
            existingMapping.setUuid(userSessionMapping.getUuid());
            existingMapping.setSessionId(userSessionMapping.getSessionId());
            existingMapping.setCohort(userSessionMapping.getCohort());
            existingMapping.setUser(userSessionMapping.getUser());
            return userSessionMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("UserSessionMapping not found"));
    }

    @Override
    public void deleteUserSessionMapping(String sessionId) {
        userSessionMappingRepository.deleteById(sessionId);
    }

    @Override
    public void invalidateAllUserSessions(String userId) {
        try {
            logger.info("Invalidating all sessions for user: {}", userId);
            
            // Get all active sessions for the user
            List<UserSessionMapping> userSessions = getUserSessionMappingsByUserId(userId);
            
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            
            for (UserSessionMapping session : userSessions) {
                // Only invalidate sessions that are still active (no end timestamp)
                if (session.getSessionEndTimestamp() == null) {
                    session.setSessionEndTimestamp(now);
                    userSessionMappingRepository.save(session);
                    logger.debug("Invalidated session: {} for user: {}", session.getSessionId(), userId);
                }
            }
            
            logger.info("Successfully invalidated all active sessions for user: {}", userId);
            
        } catch (Exception e) {
            logger.error("Error invalidating all sessions for user: {}", userId, e);
            throw new RuntimeException("Failed to invalidate user sessions", e);
        }
    }
    
    @Override
    public UserSessionMapping findOrCreateAutoSession(String userId, String cohortId) {
        // First check if an active auto session exists
        List<UserSessionMapping> activeSessions = 
            userSessionMappingRepository.findByUser_UserIdAndCohort_CohortIdAndSessionEndTimestampIsNull(userId, cohortId);

        if (!activeSessions.isEmpty()) {
            return activeSessions.get(0); // reuse the first active one
        }

        // Otherwise create a new auto session
        UserSessionMapping session = new UserSessionMapping();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUuid(UUID.randomUUID().toString());
        session.setSessionStartTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        session.setSessionEndTimestamp(null);

        // Attach user & cohort refs
        User user = new User();
        user.setUserId(userId);
        session.setUser(user);

        Cohort cohort = new Cohort();
        cohort.setCohortId(cohortId);
        session.setCohort(cohort);

        return userSessionMappingRepository.save(session);
    }

    
    
    @Override
    public CohortSessionsResponseDTO getLatestSessionsForCohortStructured(String mentorUserId, String cohortId) {
        // Validate mentor
        validateMentorInCohort(mentorUserId, cohortId);
        
        // Get cohort details
        Cohort cohort = cohortRepository.findByCohortId(cohortId)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
        
        // Build response structure
        CohortSessionsResponseDTO response = new CohortSessionsResponseDTO();
        
        // 1. Set organization details (once)
        Organization org = cohort.getOrganization();
        response.setOrganization(convertToOrganizationDTO(org));
        
        // 2. Set cohort details (once)
        CohortDetailsDTO cohortDetails = buildCohortDetails(cohort, cohortId);
        response.setCohort(cohortDetails);
        
        // 3. Get all users in cohort and their session history
        List<UserSessionDetailsDTO> userDetailsList = buildUserSessionDetailsList(cohortId);
        response.setUsers(userDetailsList);
        
        return response;
    }

    @Override
    public CohortSessionsResponseDTO getLatestSessionsForUserStructured(String mentorUserId, String targetUserId, String cohortId) {
        // Validate mentor
        validateMentorInCohort(mentorUserId, cohortId);
        
        // Validate target user exists and is in cohort
        User targetUser = userRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        boolean isTargetUserInCohort = userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(targetUserId, cohortId);
        if (!isTargetUserInCohort) {
            throw new RuntimeException("Target user is not enrolled in the specified cohort");
        }
        
        // Get cohort details
        Cohort cohort = cohortRepository.findByCohortId(cohortId)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
        
        // Build response structure
        CohortSessionsResponseDTO response = new CohortSessionsResponseDTO();
        
        // 1. Set organization details
        Organization org = cohort.getOrganization();
        response.setOrganization(convertToOrganizationDTO(org));
        
        // 2. Set cohort details
        CohortDetailsDTO cohortDetails = buildCohortDetails(cohort, cohortId);
        response.setCohort(cohortDetails);
        
        // 3. Get single user's session history
        UserSessionDetailsDTO userDetails = buildUserSessionDetails(targetUser, cohortId);
        response.setUsers(Collections.singletonList(userDetails));
        
        return response;
    }

    private CohortDetailsDTO buildCohortDetails(Cohort cohort, String cohortId) {
        CohortDetailsDTO cohortDetails = new CohortDetailsDTO();
        cohortDetails.setCohortId(cohort.getCohortId());
        cohortDetails.setCohortName(cohort.getCohortName());
        
        // Set program details
        ProgramCountDTO programDTO = getProgramDetailsForCohort(cohortId);
        cohortDetails.setProgram(programDTO);
        
        // Set user counts (once at cohort level)
        int totalUsers = userCohortMappingRepository.countByCohortCohortId(cohortId);
        int activeUsers = userCohortMappingRepository.countActiveByCohortCohortId(cohortId);
        int deactivatedUsers = userCohortMappingRepository.countDeactivatedByCohortCohortId(cohortId);
        
        cohortDetails.setTotalUsers(totalUsers);
        cohortDetails.setActiveUsers(activeUsers);
        cohortDetails.setDeactivatedUsers(deactivatedUsers);
        
        return cohortDetails;
    }

    private List<UserSessionDetailsDTO> buildUserSessionDetailsList(String cohortId) {
        // Get all users in the cohort
        List<UserCohortMapping> userCohortMappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
        
        List<UserSessionDetailsDTO> userDetailsList = new ArrayList<>();
        
        for (UserCohortMapping mapping : userCohortMappings) {
            User user = mapping.getUser();
            UserSessionDetailsDTO userDetails = buildUserSessionDetails(user, cohortId);
            userDetails.setStatus(mapping.getStatus()); // Set status from mapping
            userDetails.setLeaderboardScore(mapping.getLeaderboardScore());
            userDetailsList.add(userDetails);
        }
        
        return userDetailsList;
    }

    private UserSessionDetailsDTO buildUserSessionDetails(User user, String cohortId) {
        UserSessionDetailsDTO userDetails = new UserSessionDetailsDTO();
        userDetails.setUserId(user.getUserId());
        userDetails.setUserName(user.getUserName());
        userDetails.setUserType(user.getUserType());
        userDetails.setUserEmail(user.getUserEmail());
        userDetails.setCreatedAt(user.getCreatedAt());
        userDetails.setDeactivatedAt(user.getDeactivatedAt());
        userDetails.setDeactivatedReason(user.getDeactivatedReason());
        
        // Get status from UserCohortMapping
        String userStatus = getUserStatusFromCohortMapping(user.getUserId(), cohortId);
        userDetails.setStatus(userStatus);
        
        // Get latest 5 sessions for this user in this cohort
        List<SessionTimestampDTO> recentSessions = getLatest5Sessions(user.getUserId(), cohortId);
        userDetails.setRecentSessions(recentSessions);
        
        return userDetails;
    }

    private List<SessionTimestampDTO> getLatest5Sessions(String userId, String cohortId) {
        // Use Pageable to limit to 5 results
        Pageable limit5 = PageRequest.of(0, 5);
        
        List<UserSessionMapping> sessions = userSessionMappingRepository
                .findTop5SessionsByUserIdAndCohortId(userId, cohortId, limit5);
        
        return sessions.stream()
                .map(session -> new SessionTimestampDTO(
                    session.getSessionId(),
                    session.getSessionStartTimestamp(),
                    session.getSessionEndTimestamp()
                ))
                .collect(Collectors.toList());
    }
    
    private ProgramCountDTO getProgramDetailsForCohort(String cohortId) {
        Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository.findByCohortCohortId(cohortId);
        
        if (cohortProgramOpt.isPresent()) {
            CohortProgram cohortProgram = cohortProgramOpt.get();
            Program program = cohortProgram.getProgram();
            
            ProgramCountDTO programDTO = new ProgramCountDTO();
            programDTO.setProgramId(program.getProgramId());
            programDTO.setProgramName(program.getProgramName());
            programDTO.setTotalStages(program.getStages());
            programDTO.setTotalUnits(program.getUnitCount());
           
            return programDTO;
        }
        return null;
    }
    
    private void validateMentorInCohort(String mentorUserId, String cohortId) {
        // 1. Check that user exists
        User mentor = userRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor user not found"));

        // 2. Check user type
        if (!"Mentor".equalsIgnoreCase(mentor.getUserType())) {
            throw new RuntimeException("User is not a mentor");
        }

        // 3. Check that mentor is mapped to this cohort
        UserCohortMapping mapping = userCohortMappingRepository
                .findByUser_UserIdAndCohort_CohortId(mentorUserId, cohortId)
                .orElseThrow(() -> new RuntimeException("Mentor is not enrolled in the specified cohort"));

        // 4. Check status in mapping (cohort-level)
        if ("DISABLED".equalsIgnoreCase(mapping.getStatus())) {
            String reason = mentor.getDeactivatedReason();
            String msg = "Mentor has been deactivated in this cohort";
            if (reason != null && !reason.isBlank()) {
                msg += ": " + reason;
            }
            throw new RuntimeException(msg);
        }

        // 5. also check global user status
        if (mentor.getStatus() != null && !"ACTIVE".equalsIgnoreCase(mentor.getStatus())) {
            String reason = mentor.getDeactivatedReason();
            String msg = "Mentor account is deactivated";
            if (reason != null && !reason.isBlank()) {
                msg += ": " + reason;
            }
            throw new RuntimeException(msg);
        }
    }

    
    
    private String getUserStatusFromCohortMapping(String userId, String cohortId) {
        Optional<UserCohortMapping> userCohortMapping = userCohortMappingRepository
                .findByUser_UserIdAndCohort_CohortId(userId, cohortId);
        
        return userCohortMapping.map(UserCohortMapping::getStatus)
                .orElse("NOT_ENROLLED");
    }
    
    private OrganizationDTO convertToOrganizationDTO(Organization org) {
        if (org == null) return null;
        
        OrganizationDTO dto = new OrganizationDTO();
        dto.setOrganizationId(org.getOrganizationId());
        dto.setOrganizationName(org.getOrganizationName());
        dto.setOrganizationAdminName(org.getOrganizationAdminName());
        dto.setOrganizationAdminEmail(org.getOrganizationAdminEmail());
        dto.setOrganizationAdminPhone(org.getOrganizationAdminPhone());
        dto.setCreatedAt(org.getCreatedAt());
        dto.setUpdatedAt(org.getUpdatedAt());
        dto.setDeletedAt(org.getDeletedAt());
        return dto;
    }
}