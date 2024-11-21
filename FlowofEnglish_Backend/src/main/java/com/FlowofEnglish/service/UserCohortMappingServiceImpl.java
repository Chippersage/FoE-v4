package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.repository.CohortRepository;
import com.FlowofEnglish.repository.UserCohortMappingRepository;
import com.FlowofEnglish.repository.UserRepository;

import com.opencsv.CSVReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserCohortMappingServiceImpl implements UserCohortMappingService {

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CohortRepository cohortRepository;

    @Override
    public UserCohortMapping createUserCohortMapping(String userId, String cohortId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found.");
        }
        if (cohortOpt.isEmpty()) {
            throw new IllegalArgumentException("Cohort with ID " + cohortId + " not found.");
        }

        User user = userOpt.get();
        Cohort cohort = cohortOpt.get();

        if (!user.getOrganization().getOrganizationId().equals(cohort.getOrganization().getOrganizationId())) {
            throw new IllegalArgumentException("User and Cohort must belong to the same organization.");
        }

        if (userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(userId, cohortId)) {
            throw new IllegalArgumentException("User is already mapped to this Cohort.");
        }

        UserCohortMapping mapping = new UserCohortMapping();
        mapping.setUser(user);
        mapping.setCohort(cohort);
        mapping.setUuid(UUID.randomUUID().toString());
        mapping.setLeaderboardScore(0);

        return userCohortMappingRepository.save(mapping);
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
    public List<UserCohortMappingDTO> getUserCohortMappingsByCohortId(String cohortId) {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByCohortCohortId(cohortId);
        return mappings.stream().map(this::convertToDTO).collect(Collectors.toList());
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
