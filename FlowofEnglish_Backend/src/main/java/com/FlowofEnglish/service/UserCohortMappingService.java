package com.FlowofEnglish.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;

public interface UserCohortMappingService {
    Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId);

    UserCohortMapping updateUserCohortMappingByCohortId(String cohortId, UserCohortMapping userCohortMapping);

    UserCohortMapping createUserCohortMapping(String userId, String cohortId);

    UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);

    Map<String, List<String>> importUserCohortMappingsWithResponse(MultipartFile file);

    Map<String, Object> getUserCohortMappingsWithLeaderboard(String cohortId);

    Map<String, Object> getUserCohortMappingsByCohortId(String cohortId);

    List<UserCohortMappingDTO> getAllUserCohortMappings();

    List<UserCohortMappingDTO> getUserCohortMappingsCohortId(String cohortId);

    UserCohortMapping findByUserUserId(String userId);

    Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId);

    List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId);

    Optional<UserCohortMapping> findByUserUserIdAndProgramId(String userId, String programId);

    void deleteUserCohortMappingByUserId(String userId);

    void updateUserCohortMapping(int userCohortId, UserCohortMapping userCohortMapping);

    UserCohortMappingDTO updateLeaderboardScore(String userId, String cohortId, Integer scoreToAdd);

	UserCohortMapping updateUserCohortMapping(String userId, String cohortId, UserCohortMapping userCohortMapping);
}
