package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import com.opencsv.CSVReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserCohortMappingServiceImpl implements UserCohortMappingService {

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CohortRepository cohortRepository;
    @Autowired
    private CohortProgramRepository cohortProgramRepository;
    
    @Autowired
    private EmailService emailService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserCohortMappingServiceImpl.class);

    @Override
    public UserCohortMapping createUserCohortMapping(String userId, String cohortId) {
        logger.info("Starting createUserCohortMapping for userId: {}, cohortId: {}", userId, cohortId);

        // Fetch user and cohort details
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);

        if (userOpt.isEmpty()) {
            logger.error("User not found with ID: {}", userId);
            throw new IllegalArgumentException("User not found. Please check the user ID and try again.");
        }
        if (cohortOpt.isEmpty()) {
            logger.error("Cohort not found with ID: {}", cohortId);
            throw new IllegalArgumentException("Cohort not found. Please check the cohort ID and try again.");
        }

        User user = userOpt.get();
        logger.info("Found user: {}, email: {}", user.getUserName(), user.getUserEmail());

        Cohort cohort = cohortOpt.get();

        // Organization validation
        if (!user.getOrganization().getOrganizationId().equals(cohort.getOrganization().getOrganizationId())) {
            logger.error("User and Cohort belong to different organizations. UserOrg: {}, CohortOrg: {}",
                    user.getOrganization().getOrganizationId(), cohort.getOrganization().getOrganizationId());
            throw new IllegalArgumentException("User and Cohort must belong to the same organization.");
        }

        // Check for existing mapping
        if (userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(userId, cohortId)) {
            logger.warn("User with ID {} is already mapped to Cohort with ID {}", userId, cohortId);
            throw new IllegalArgumentException("This user is already mapped to the selected cohort.");
        }

        // Send email notification if email exists
        if (user.getUserEmail() != null && !user.getUserEmail().isEmpty()) {
            logger.info("User has a valid email: {}", user.getUserEmail());

            try {
                Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository.findByCohortCohortId(cohortId);

                if (cohortProgramOpt.isPresent()) {
                    CohortProgram cohortProgram = cohortProgramOpt.get();
                    logger.info("Found cohort program mapping. Program name: {}", cohortProgram.getProgram().getProgramName());

                    // Send email
                    try {
                        emailService.sendCohortAssignmentEmail(
                                user.getUserEmail(),
                                user.getUserName(),
                                cohort.getCohortName(),
                                cohortProgram.getProgram().getProgramName(),
                                user.getOrganization().getOrganizationName()
                        );
                        logger.info("Successfully sent cohort assignment email to {}", user.getUserEmail());
                    } catch (Exception e) {
                        logger.error("Failed to send email to {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
                    }
                } else {
                    logger.warn("No cohort program mapping found for cohortId: {}", cohortId);
                }
            } catch (Exception e) {
                logger.error("Error while processing cohort program mapping for cohortId: {}. Error: {}", cohortId, e.getMessage(), e);
            }
        } else {
            logger.warn("User with ID {} has no email address. Skipping email notification.", userId);
        }

        // Create user-cohort mapping
        UserCohortMapping mapping = new UserCohortMapping();
        mapping.setUser(user);
        mapping.setCohort(cohort);
        mapping.setUuid(UUID.randomUUID().toString());
        mapping.setLeaderboardScore(0);

        UserCohortMapping savedMapping = userCohortMappingRepository.save(mapping);
        logger.info("Successfully created user-cohort mapping for userId: {}", userId);

        return savedMapping;
    }


    @Override
    public UserCohortMapping updateUserCohortMappingByCohortId(String cohortId, UserCohortMapping userCohortMapping) {
    	List<UserCohortMapping> existingMappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
    	if (existingMappings.isEmpty()) {
            throw new IllegalArgumentException("UserCohortMapping not found with ID: " + cohortId);
        }
    	UserCohortMapping existingMapping = existingMappings.get(0);

        // Find the new cohort by its ID
        Cohort newCohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new IllegalArgumentException("Cohort with ID " + cohortId + " not found."));

        // Check if the user and the new cohort belong to the same organization
        if (!existingMapping.getUser().getOrganization().getOrganizationId().equals(newCohort.getOrganization().getOrganizationId())) {
            throw new IllegalArgumentException("User and new Cohort must belong to the same organization.");
        }

        // Update the cohort and save the mapping
        existingMapping.setCohort(newCohort);
        userCohortMappingRepository.save(existingMapping);
        
        System.out.println("User-Cohort mapping successfully updated for Cohort ID: " + cohortId);

        return existingMapping;
    }
    
    private String validateCsvData(String userId, String cohortId) {
        if (userId == null || userId.isEmpty()) {
            return "User ID is empty.";
        }
        if (cohortId == null || cohortId.isEmpty()) {
            return "Cohort ID is empty.";
        }
        if (!userRepository.existsById(userId)) {
            return "User with ID " + userId + " not found.";
        }
        if (!cohortRepository.existsById(cohortId)) {
            return "Cohort with ID " + cohortId + " not found.";
        }
        if (userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(userId, cohortId)) {
            return "User " + userId + " is already mapped to Cohort " + cohortId + ".";
        }
        return null; // No errors
    }

    @Override
    public void updateUserCohortMapping(int userCohortId, UserCohortMapping userCohortMapping) {
        // Assuming userCohortId is the primary key, simply save the updated entity
        userCohortMappingRepository.save(userCohortMapping);
    }
    
    public Map<String, List<String>> importUserCohortMappingsWithResponse(MultipartFile file) {
        List<String> successMessages = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            reader.readNext(); // Skip header row

            while ((line = reader.readNext()) != null) {
                String userId = line[0].trim();
                String cohortId = line[1].trim();

                String validationError = validateCsvData(userId, cohortId);
                if (validationError != null) {
                    errorMessages.add("Row [" + userId + ", " + cohortId + "]: " + validationError);
                    continue;
                }

                try {
                    createUserCohortMapping(userId, cohortId);
                    successMessages.add("Successfully mapped User " + userId + " to Cohort " + cohortId + ".");
                } catch (Exception e) {
                    errorMessages.add("Row [" + userId + ", " + cohortId + "]: Unexpected error - " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errorMessages.add("Critical Error: " + e.getMessage());
        }

        Map<String, List<String>> response = new HashMap<>();
        response.put("success", successMessages);
        response.put("errors", errorMessages);
        return response;
    }

    
    @Override
    public UserCohortMapping updateUserCohortMapping(String userId, UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.findByUserUserId(userId).map(existingMapping -> {
            if (!userCohortMapping.getUser().getOrganization().equals(userCohortMapping.getCohort().getOrganization())) {
                throw new IllegalArgumentException("User and Cohort must belong to the same organization.");
            }
            existingMapping.setCohort(userCohortMapping.getCohort());
            existingMapping.setLeaderboardScore(userCohortMapping.getLeaderboardScore());
            return userCohortMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("UserCohortMapping not found for userId: " + userId));
    }

    @Override
    public Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId) {
        return userCohortMappingRepository.findByUser_UserIdAndCohort_CohortId(userId, cohortId);
    }
    
    

    @Override
    public List<UserCohortMappingDTO> getAllUserCohortMappings() {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAll();
        return mappings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List<UserCohortMappingDTO> getUserCohortMappingsCohortId(String cohortId) {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
        return mappings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    @Override
    public Map<String, Object> getUserCohortMappingsByCohortId(String cohortId) {
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);
        if (!cohortOpt.isPresent()) {
            throw new IllegalArgumentException("Cohort not found with ID: " + cohortId);
        }

        Cohort cohort = cohortOpt.get();

        // Check the Show_leaderboard flag
        if (!cohort.isShowLeaderboard()) {
            // If the leaderboard is disabled, return the information with a "not available" status
            return Map.of("leaderboardStatus", "not available", "message", "Leaderboard is disabled for this cohort.");
        }

        // If the leaderboard is enabled, fetch and return the data
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
        List<UserCohortMappingDTO> mappingDTOs = mappings.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return Map.of("leaderboardStatus", "available", "leaderboardData", mappingDTOs);
    }

    
    @Override
    public Map<String, Object> getUserCohortMappingsWithLeaderboard(String cohortId) {
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);
        if (!cohortOpt.isPresent()) {
            throw new IllegalArgumentException("Cohort not found with ID: " + cohortId);
        }

        Cohort cohort = cohortOpt.get();

        // Check the Show_leaderboard flag
        if (!cohort.isShowLeaderboard()) {
            // If the leaderboard is disabled, return the information with a "not available" flag
            return Map.of("leaderboardStatus", "not available");
        }

        // Otherwise, return the leaderboard data
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
        List<UserCohortMappingDTO> mappingDTOs = mappings.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return Map.of("leaderboardStatus", "available", "leaderboardData", mappingDTOs);
    }

    @Override
    public UserCohortMapping findByUserUserId(String userId) {
        return userCohortMappingRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("UserCohortMapping not found for userId: " + userId));
    }

    @Override
    public Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId) {
        return userCohortMappingRepository.findByUserUserId(userId);
    }
    
    @Override
    public Optional<UserCohortMapping> findByUserUserIdAndProgramId(String userId, String programId) {
        return userCohortMappingRepository.findByUserUserIdAndProgramId(userId, programId);
    }

    @Override
    public List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId) {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByUserUserId(userId);
        return mappings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.save(userCohortMapping);
    }
    
    @Override
    public void deleteUserCohortMappingByUserId(String userId) {
        userCohortMappingRepository.deleteByUserUserId(userId);
    }

    private UserCohortMappingDTO convertToDTO(UserCohortMapping userCohortMapping) {
        UserCohortMappingDTO dto = new UserCohortMappingDTO();
        //dto.setOrganizationName(userCohortMapping.getCohort().getOrganization().getOrganizationName());
        dto.setCohortId(userCohortMapping.getCohort().getCohortId());
        dto.setUserId(userCohortMapping.getUser().getUserId());
        dto.setUserName(userCohortMapping.getUser().getUserName());
        dto.setCohortName(userCohortMapping.getCohort().getCohortName());
        dto.setLeaderboardScore(userCohortMapping.getLeaderboardScore());
        return dto;
    }
}
