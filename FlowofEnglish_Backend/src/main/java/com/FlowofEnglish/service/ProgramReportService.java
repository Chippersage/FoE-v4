package com.FlowofEnglish.service;

import java.util.List;

import com.FlowofEnglish.dto.AttemptDTO;
import com.FlowofEnglish.dto.StageReportDTO;
import com.FlowofEnglish.dto.UnitReportDTO;
import com.FlowofEnglish.dto.ProgramReportDTO;
public interface ProgramReportService {
	ProgramReportDTO generateProgramReport(String userId, String programId);
    StageReportDTO generateStageReport(String userId, String stageId);
    UnitReportDTO generateUnitReport(String userId, String unitId);
    List<AttemptDTO> getUserAttempts(String userId, String subconceptId);

}
