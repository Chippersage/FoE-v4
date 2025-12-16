package com.FlowofEnglish.service;

import java.util.*;
import org.springframework.web.multipart.MultipartFile;
import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;

public interface UserCohortMappingService {
    Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId);
    UserCohortMapping updateUserCohortMappingByCohortId(String cohortId, UserCohortMapping userCohortMapping);
    UserCohortMapping createUserCohortMapping(String userId, String cohortId);
    UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);
    Map<String, List<String>> importUserCohortMappingsWithResponse(MultipartFile file);
    List<UserCohortMappingDTO> getAllUserCohortMappings();
    List<UserCohortMappingDTO> getUserCohortMappingsCohortId(String cohortId);
    UserCohortMapping findByUserUserId(String userId);
    
    LeaderboardResponseDTO getUserCohortMappingsWithLeaderboard(String cohortId);
    LeaderboardResponseDTO getUserCohortMappingsByCohortId(String cohortId);
    MentorCohortUsersResponseDTO getUsersByCohortForMentor(String mentorId, String cohortId);
    UserCohortMapping disableUserFromCohort(String userId, String cohortId, String reason);
    UserCohortMapping reactivateUserInCohort(String userId, String cohortId);
    String getDeactivationDetails(String userId, String cohortId);

    Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId);
    List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId);
    Optional<UserCohortMapping> findByUserUserIdAndProgramId(String userId, String programId);
    void deleteUserCohortMappingByUserId(String userId);
    void deleteUserCohortMappingByUserIdAndCohortId(String userId, String cohortId);
    void updateUserCohortMapping(int userCohortId, UserCohortMapping userCohortMapping);
    UserCohortMappingDTO updateLeaderboardScore(String userId, String cohortId, Integer scoreToAdd);
	UserCohortMapping updateUserCohortMapping(String userId, String cohortId, UserCohortMapping userCohortMapping);
}
