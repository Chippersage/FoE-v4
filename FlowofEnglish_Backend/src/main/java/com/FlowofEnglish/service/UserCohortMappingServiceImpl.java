package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.repository.UserCohortMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserCohortMappingServiceImpl implements UserCohortMappingService {

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;

    @Override
    public List<UserCohortMappingDTO> getAllUserCohortMappings() {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAll();
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
    public List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId) {
        List<UserCohortMapping> mappings = userCohortMappingRepository.findAllByUserUserId(userId);
        return mappings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.save(userCohortMapping);
    }

    @Override
    public UserCohortMapping updateUserCohortMapping(String userId, UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.findByUserUserId(userId).map(existingMapping -> {
            existingMapping.setCohort(userCohortMapping.getCohort());
            existingMapping.setUser(userCohortMapping.getUser());
            existingMapping.setLeaderboardScore(userCohortMapping.getLeaderboardScore());
            return userCohortMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("UserCohortMapping not found"));
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
