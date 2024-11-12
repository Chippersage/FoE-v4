package com.FlowofEnglish.controller;

import com.FlowofEnglish.exception.CohortNotFoundException;
import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.service.CohortService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cohorts")
public class CohortController {

    @Autowired
    private CohortService cohortService;

    @GetMapping
    public List<Cohort> getAllCohorts() {
        return cohortService.getAllCohorts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cohort> getCohortById(@PathVariable String id) {
        return cohortService.getCohortById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organization/{organizationId}")
    public List<Cohort> getCohortsByOrganizationId(@PathVariable String organizationId) {
        return cohortService.getCohortsByOrganizationId(organizationId);
    }

    @PostMapping("/create")
    public Cohort createCohort(@RequestBody Cohort cohort) {
        return cohortService.createCohort(cohort);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cohort> updateCohort(@PathVariable String id, @RequestBody Cohort cohort) {
        try {
            return ResponseEntity.ok(cohortService.updateCohort(id, cohort));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCohort(@PathVariable String id) {
        try {
            cohortService.deleteCohort(id);
            return ResponseEntity.noContent().build();
        } catch (CohortNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
