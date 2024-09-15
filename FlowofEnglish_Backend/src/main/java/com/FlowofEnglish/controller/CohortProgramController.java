package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.CohortProgram;
import com.FlowofEnglish.service.CohortProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/cohortprogram")
public class CohortProgramController {

    @Autowired
    private CohortProgramService cohortProgramService;

    @GetMapping
    public List<CohortProgram> getAllCohortPrograms() {
        return cohortProgramService.getAllCohortPrograms();
    }

    @GetMapping("/{cohortProgramId}")
    public ResponseEntity<CohortProgram> getCohortProgram(@PathVariable Long cohortProgramId) {
        Optional<CohortProgram> cohortProgram = cohortProgramService.getCohortProgram(cohortProgramId);
        return cohortProgram.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public CohortProgram createCohortProgram(@RequestBody CohortProgram cohortProgram) {
        return cohortProgramService.createCohortProgram(cohortProgram);
    }

    @DeleteMapping("/{cohortProgramId}")
    public ResponseEntity<Void> deleteCohortProgram(@PathVariable Long cohortProgramId) {
        cohortProgramService.deleteCohortProgram(cohortProgramId);
        return ResponseEntity.noContent().build();
    }
}
