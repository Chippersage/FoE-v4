package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.repository.UserCohortMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserCohortMappingServiceImpl implements UserCohortMappingService {

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;

    @Override
    public List<UserCohortMapping> getAllUserCohortMappings() {
        return userCohortMappingRepository.findAll();
    }

    @Override
    public Optional<UserCohortMapping> getUserCohortMappingById(int leaderboardScore) {
        return userCohortMappingRepository.findById(leaderboardScore);
    }

    @Override
    public UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.save(userCohortMapping);
    }

    @Override
    public UserCohortMapping updateUserCohortMapping(int leaderboardScore, UserCohortMapping userCohortMapping) {
        return userCohortMappingRepository.findById(leaderboardScore).map(existingMapping -> {
            existingMapping.setLeaderboardScore(userCohortMapping.getLeaderboardScore());
            existingMapping.setUuid(userCohortMapping.getUuid());
            existingMapping.setCohort(userCohortMapping.getCohort());
            existingMapping.setUser(userCohortMapping.getUser());
            return userCohortMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("UserCohortMapping not found"));
    }

    @Override
    public void deleteUserCohortMapping(int leaderboardScore) {
        userCohortMappingRepository.deleteById(leaderboardScore);
    }
}
