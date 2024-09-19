package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.CohortDTO;
import com.FlowofEnglish.model.Cohort;

import java.util.List;
import java.util.Optional;

public interface CohortService {

    List<Cohort> getAllCohorts();

    Optional<Cohort> getCohortById(String cohortId);

    List<Cohort> getCohortsByOrganizationId(String organizationId);

    Cohort createCohort(Cohort cohort);

    Cohort updateCohort(String cohortId, Cohort cohort);

    void deleteCohort(String cohortId);

	CohortDTO convertToDTO(Cohort cohort);
}
