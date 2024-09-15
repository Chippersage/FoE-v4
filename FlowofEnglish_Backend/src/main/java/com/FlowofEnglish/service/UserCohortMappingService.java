package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserCohortMapping;
import java.util.List;
import java.util.Optional;

public interface UserCohortMappingService {
    List<UserCohortMapping> getAllUserCohortMappings();
    Optional<UserCohortMapping> getUserCohortMappingById(int leaderboardScore);
    UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);
    UserCohortMapping updateUserCohortMapping(int leaderboardScore, UserCohortMapping userCohortMapping);
    void deleteUserCohortMapping(int leaderboardScore);
}
