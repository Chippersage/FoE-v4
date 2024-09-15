package com.FlowofEnglish.service;

import com.FlowofEnglish.model.CohortProgram;
import java.util.List;
import java.util.Optional;

public interface CohortProgramService {
    List<CohortProgram> getAllCohortPrograms();
    Optional<CohortProgram> getCohortProgram(Long cohortProgramId);
    CohortProgram createCohortProgram(CohortProgram cohortProgram);
    void deleteCohortProgram(Long cohortProgramId);
}
