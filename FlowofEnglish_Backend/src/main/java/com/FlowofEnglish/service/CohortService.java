package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import java.util.*;

public interface CohortService {

    List<Cohort> getAllCohorts();

    Optional<Cohort> getCohortById(String cohortId);
    
//    OrganizationCohortsDTO getCohortsByOrganizationId(String organizationId);
    List<Cohort> getCohortsByOrganizationId(String organizationId);
    
    Cohort createCohort(Cohort cohort);

    Cohort updateCohort(String cohortId, Cohort cohort);

    void deleteCohort(String cohortId);

	CohortDTO convertToDTO(Cohort cohort);
}
