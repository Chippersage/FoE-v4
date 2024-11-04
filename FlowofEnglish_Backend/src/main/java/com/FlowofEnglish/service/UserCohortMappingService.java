package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserCohortMappingDTO;
import com.FlowofEnglish.model.UserCohortMapping;
import java.util.List;
import java.util.Optional;

public interface UserCohortMappingService {
	Optional<UserCohortMapping> findByUser_UserIdAndCohort_CohortId(String userId, String cohortId);
	UserCohortMapping updateUserCohortMapping(String cohortId, UserCohortMapping userCohortMapping);
	UserCohortMapping createUserCohortMapping(UserCohortMapping userCohortMapping);
	
    List<UserCohortMappingDTO> getAllUserCohortMappings();
    List<UserCohortMappingDTO> getUserCohortMappingsByCohortId(String cohortId);
    UserCohortMapping findByUserUserId(String userId);
    Optional<UserCohortMapping> getUserCohortMappingByUserId(String userId);
    List<UserCohortMappingDTO> getUserCohortMappingsByUserId(String userId);
    Optional<UserCohortMapping> findByUserUserIdAndProgramId(String userId, String programId);
    void deleteUserCohortMappingByUserId(String userId);
	void updateUserCohortMapping(int userCohortId, UserCohortMapping userCohortMapping);
}
