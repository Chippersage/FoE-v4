package com.FlowofEnglish.service;

import java.util.List;

import com.FlowofEnglish.dto.*;
public interface ProgramReportService {
	ProgramReportDTO generateProgramReport(String userId, String programId);
    StageReportDTO generateStageReport(String userId, String stageId);
    UnitReportDTO generateUnitReport(String userId, String unitId);
    List<AttemptDTO> getUserAttempts(String userId, String subconceptId);
    CohortProgressDTO getCohortProgress(String programId, String cohortId);
    
    byte[] generatePdfReport(String userId, String programId); 
    byte[] generateCsvReport(String userId, String programId);
}
