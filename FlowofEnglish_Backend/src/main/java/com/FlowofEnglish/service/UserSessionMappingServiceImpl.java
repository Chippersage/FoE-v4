package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import com.FlowofEnglish.dto.*;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
        // You'll need to add this method to your repository
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

    // new methods for the mentor screen
    @Override
    public List<UserSessionDTO> getLatestSessionsByCohortId(String cohortId) {
        List<UserSessionMapping> sessions = userSessionMappingRepository.findLatestSessionsByCohortId(cohortId);
        
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserSessionDTO getLatestSessionForUserInCohort(String mentorUserId, String targetUserId, String cohortId) {
        // Validate mentor user type and cohort membership
        validateMentorInCohort(mentorUserId, cohortId);
        
        // Validate target user exists and is in cohort
        User targetUser = userRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));
        
        boolean isTargetUserInCohort = userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(targetUserId, cohortId);
        if (!isTargetUserInCohort) {
            throw new RuntimeException("Target user is not enrolled in the specified cohort");
        }
        
        // Get latest session for the target user in the cohort
        List<UserSessionMapping> latestSessions = userSessionMappingRepository
                .findLatestSessionByUserIdAndCohortId(targetUserId, cohortId);
        
        if (latestSessions.isEmpty()) {
            // Return empty DTO with user info but no session data
            return createUserSessionDTOWithUserInfo(targetUser, cohortId);
        }
        
        UserSessionMapping latestSession = latestSessions.get(0);
        UserSessionDTO dto = convertToDTO(latestSession);
        
        // Enhance with organization and program details
        return enhanceSessionWithOrganizationAndProgram(dto, cohortId);
    }
    
    private UserSessionDTO createUserSessionDTOWithUserInfo(User user, String cohortId) {
        UserSessionDTO dto = new UserSessionDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setUserType(user.getUserType());
        dto.setUserEmail(user.getUserEmail());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setDeactivatedAt(user.getDeactivatedAt());
        dto.setDeactivatedReason(user.getDeactivatedReason());
        
        // Get user status from UserCohortMapping
        String userStatus = getUserStatusFromCohortMapping(user.getUserId(), cohortId);
        dto.setStatus(userStatus);
        
        dto.setCohortId(cohortId);
        
        // Get cohort name
        Cohort cohort = cohortRepository.findByCohortId(cohortId)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
        dto.setCohortName(cohort.getCohortName());
        
        return enhanceSessionWithOrganizationAndProgram(dto, cohortId);
    }
    
    private UserSessionDTO enhanceSessionWithOrganizationAndProgram(UserSessionDTO dto, String cohortId) {
        Cohort cohort = cohortRepository.findByCohortId(cohortId)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
        
        // Set organization
        Organization org = cohort.getOrganization();
        OrganizationDTO organizationDTO = convertToOrganizationDTO(org);
        dto.setOrganization(organizationDTO);
        
        // Set program
        ProgramCountDTO programDTO = getProgramDetailsForCohort(cohortId);
        dto.setProgram(programDTO);
        
        // Set user counts for the cohort
        setUserCountsForCohort(dto, cohortId);
        
        return dto;
    }
    
    private void setUserCountsForCohort(UserSessionDTO dto, String cohortId) {
        int totalUsers = userCohortMappingRepository.countByCohortCohortId(cohortId);
        int activeUsers = userCohortMappingRepository.countActiveByCohortCohortId(cohortId);
        int deactivatedUsers = userCohortMappingRepository.countDeactivatedByCohortCohortId(cohortId);
        
        dto.setTotalUsers(totalUsers);
        dto.setActiveUsers(activeUsers);
        dto.setDeactivatedUsers(deactivatedUsers);
    }

    @Override
    public List<UserSessionDTO> getLatestSessionsForCohortWithMentorValidation(String mentorUserId, String cohortId) {
        // Validate mentor
        validateMentorInCohort(mentorUserId, cohortId);
        
        // Get latest sessions for all users in the cohort
        List<UserSessionMapping> sessions = userSessionMappingRepository.findLatestSessionsByCohortId(cohortId);
        
        // Convert to DTO and enhance with organization and program details
        return enhanceSessionsWithOrganizationAndProgram(sessions, cohortId);
    }
    
    private void validateMentorInCohort(String mentorUserId, String cohortId) {
        User mentor = userRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor user not found"));
        
        if (!"Mentor".equalsIgnoreCase(mentor.getUserType())) {
            throw new RuntimeException("User is not a mentor");
        }
        
        // Validate that mentor belongs to the cohort
        boolean isMentorInCohort = userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(mentorUserId, cohortId);
        if (!isMentorInCohort) {
            throw new RuntimeException("Mentor is not enrolled in the specified cohort");
        }
    }
    
    private List<UserSessionDTO> enhanceSessionsWithOrganizationAndProgram(List<UserSessionMapping> sessions, String cohortId) {
        if (sessions.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get cohort details
        Cohort cohort = cohortRepository.findByCohortId(cohortId)
                .orElseThrow(() -> new RuntimeException("Cohort not found"));
        
        // Get organization from cohort (same for all sessions)
        Organization org = cohort.getOrganization();
        OrganizationDTO organizationDTO = convertToOrganizationDTO(org);
        
        // Get program details for this cohort
        ProgramCountDTO programDTO = getProgramDetailsForCohort(cohortId);
        
        // Calculate user counts once for the cohort
        int totalUsers = userCohortMappingRepository.countByCohortCohortId(cohortId);
        int activeUsers = userCohortMappingRepository.countActiveByCohortCohortId(cohortId);
        int deactivatedUsers = userCohortMappingRepository.countDeactivatedByCohortCohortId(cohortId);
        
        // Convert sessions to DTO and set common data
        List<UserSessionDTO> sessionDTOs = sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        // Set organization, program, and user counts for all sessions
        for (UserSessionDTO session : sessionDTOs) {
            session.setOrganization(organizationDTO);
            session.setProgram(programDTO);
            session.setTotalUsers(totalUsers);
            session.setActiveUsers(activeUsers);
            session.setDeactivatedUsers(deactivatedUsers);
        }
        
        return sessionDTOs;
    }
    
    private ProgramCountDTO getProgramDetailsForCohort(String cohortId) {
        Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository.findByCohortCohortId(cohortId);
        
        if (cohortProgramOpt.isPresent()) {
            CohortProgram cohortProgram = cohortProgramOpt.get();
            Program program = cohortProgram.getProgram();
            
            ProgramCountDTO programDTO = new ProgramCountDTO();
            programDTO.setProgramId(program.getProgramId());
            programDTO.setProgramName(program.getProgramName());
            // Note: Remove user counts from ProgramCountDTO since they're now in UserSessionDTO
            
            return programDTO;
        }
        return null;
    }
    
    private UserSessionDTO convertToDTO(UserSessionMapping session) {
        UserSessionDTO dto = new UserSessionDTO();
        dto.setUserId(session.getUser().getUserId());
        dto.setUserName(session.getUser().getUserName());
        dto.setUserType(session.getUser().getUserType());
        dto.setUserEmail(session.getUser().getUserEmail());
        dto.setCreatedAt(session.getUser().getCreatedAt());
        dto.setDeactivatedAt(session.getUser().getDeactivatedAt());
        dto.setDeactivatedReason(session.getUser().getDeactivatedReason());
        
        // Get user status from UserCohortMapping instead of User table
        String userStatus = getUserStatusFromCohortMapping(session.getUser().getUserId(), session.getCohort().getCohortId());
        dto.setStatus(userStatus);
        
        dto.setCohortId(session.getCohort().getCohortId());
        dto.setCohortName(session.getCohort().getCohortName());
        dto.setSessionStartTimestamp(session.getSessionStartTimestamp());
        dto.setSessionEndTimestamp(session.getSessionEndTimestamp());
        dto.setSessionId(session.getSessionId());
        
        return dto;
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