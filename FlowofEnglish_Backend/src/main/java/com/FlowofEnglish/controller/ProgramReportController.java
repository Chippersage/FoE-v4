package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramReportDTO;
import com.FlowofEnglish.service.ProgramReportService;

import org.springframework.beans.factory.annotation.Autowired;
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
}
