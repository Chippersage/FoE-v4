package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import java.util.List;
import java.util.Optional;

public interface UserCohortMappingService {
    List<UserCohortMappingDTO> getAllUserCohortMappings();
    Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId);
    List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId);
    UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);
    UserCohortMapping updateUserCohortMapping(String userId, UserCohortMapping userCohortMapping);
    void deleteUserCohortMappingByUserId(String userId);
}
