package com.FlowofEnglish.controller;


import com.FlowofEnglish.dto.ProgramReportDTO;
import com.FlowofEnglish.service.ProgramReportService;


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

}
