package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface UserCohortMappingService {
	Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId);
	
	UserCohortMapping updateUserCohortMappingByCohortId(String cohortId, UserCohortMapping userCohortMapping);
	UserCohortMapping updateUserCohortMapping(String userId,UserCohortMapping userCohortMapping);
	
	UserCohortMapping createUserCohortMapping(String userId, String cohortId);
	UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);
	Map<String, List<String>> importUserCohortMappingsWithResponse(MultipartFile file);
	Map<String, Object> getUserCohortMappingsWithLeaderboard(String cohortId);
	Map<String, Object> getUserCohortMappingsByCohortId(String cohortId);
    List<UserCohortMappingDTO> getAllUserCohortMappings();
   // List<UserCohortMappingDTO> getUserCohortMappingsByCohortId(String cohortId);
    UserCohortMapping findByUserUserId(String userId);
    Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId);
    List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId);
    Optional<UserCohortMapping> findByUserUserIdAndProgramId(String userId, String programId);
    void deleteUserCohortMappingByUserId(String userId);
    void updateUserCohortMapping(int userCohortId, UserCohortMapping userCohortMapping);
}
