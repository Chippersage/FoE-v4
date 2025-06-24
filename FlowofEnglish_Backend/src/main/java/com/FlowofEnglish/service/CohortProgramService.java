package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import java.util.*;

public interface CohortProgramService {
    List<CohortProgram> getAllCohortPrograms();
    Optional<CohortProgram> getCohortProgram(Long cohortProgramId);
    CohortProgram createCohortProgram(CohortProgram cohortProgram);
    void deleteCohortProgram(Long cohortProgramId);
}
