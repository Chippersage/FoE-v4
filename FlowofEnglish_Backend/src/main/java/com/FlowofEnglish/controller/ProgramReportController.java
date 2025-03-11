package com.FlowofEnglish.controller;


import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.service.*;


import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ProgramReportController {

    @Autowired
    private ProgramReportService programReportService;
    
   
  @GetMapping("/program/{userId}/{programId}")
  public ProgramReportDTO generateProgramReport(
        @PathVariable String userId,
        @PathVariable String programId) {
    return programReportService.generateProgramReport(userId, programId);
  }
  @GetMapping("/program/{programId}/cohort/{cohortId}/progress")
  public ResponseEntity<CohortProgressDTO> getCohortProgress(
      @PathVariable String programId, 
      @PathVariable String cohortId) {
      CohortProgressDTO progress = programReportService.getCohortProgress(programId, cohortId);
      return ResponseEntity.ok(progress);
  }
  @GetMapping("/program/{programId}/user/{userId}/progress")
  public ResponseEntity<UserProgressDTO> getUserProgress(
      @PathVariable String programId,
      @PathVariable String userId) {
      
      UserProgressDTO progress = programReportService.getUserProgress(programId, userId);
      return ResponseEntity.ok(progress);
  }

    @GetMapping("/program/{userId}/{programId}/download")
    public ResponseEntity<?> downloadProgramReport(
            @PathVariable String userId,
            @PathVariable String programId,
            @RequestParam String format) {
        if ("csv".equalsIgnoreCase(format)) {
            byte[] csvData = programReportService.generateCsvReport(userId, programId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.csv")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(csvData);
        } else if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdfData = programReportService.generatePdfReport(userId, programId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfData);
        } else {
            return ResponseEntity.badRequest().body("Invalid format");
        }
    }

//    /**
//     * Get concept summaries for a specific stage
//     * @param userId User ID
//     * @param stageId Stage ID
//     * @return List of concept summaries with their associated subconcepts
//     */
//    @GetMapping("/stage/{userId}/{stageId}/concepts")
//    public ResponseEntity<List<ConceptSummaryDTO>> getConceptSummariesForStage(
//            @PathVariable String userId,
//            @PathVariable String stageId) {
//        List<ConceptSummaryDTO> conceptSummaries = programReportService.getConceptSummariesForStage(userId, stageId);
//        return ResponseEntity.ok(conceptSummaries);
//    }
//    
//    /**
//     * Get concept summaries for a specific stage with detailed progress
//     * @param userId User ID
//     * @param stageId Stage ID
//     * @param includeProgress Include detailed progress information
//     * @return List of concept summaries
//     */
//    @GetMapping("/stage/{userId}/{stageId}/concepts/progress")
//    public ResponseEntity<List<ConceptSummaryDTO>> getConceptSummariesWithProgress(
//            @PathVariable String userId,
//            @PathVariable String stageId,
//            @RequestParam(defaultValue = "false") boolean includeProgress) {
//        List<ConceptSummaryDTO> conceptSummaries = programReportService.getConceptSummariesForStage(userId, stageId);
//        
//        // You can add additional processing here if includeProgress is true
//        
//        return ResponseEntity.ok(conceptSummaries);
//    }
}
