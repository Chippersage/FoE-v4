package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.service.SubconceptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/subconcepts")
public class SubconceptController {

    @Autowired
    private SubconceptService subconceptService;

    @GetMapping
    public List<Subconcept> getAllSubconcepts() {
        return subconceptService.getAllSubconcepts();
    }

    @GetMapping("/{subconceptId}")
    public ResponseEntity<Subconcept> getSubconceptById(@PathVariable String subconceptId) {
        Optional<Subconcept> subconcept = subconceptService.getSubconceptById(subconceptId);
        return subconcept.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public Subconcept createSubconcept(@RequestBody Subconcept subconcept) {
        return subconceptService.createSubconcept(subconcept);
    }

    @PutMapping("/{subconceptId}")
    public ResponseEntity<Subconcept> updateSubconcept(@PathVariable String subconceptId, @RequestBody Subconcept subconcept) {
        return ResponseEntity.ok(subconceptService.updateSubconcept(subconceptId, subconcept));
    }

    @DeleteMapping("/{subconceptId}")
    public ResponseEntity<Void> deleteSubconcept(@PathVariable String subconceptId) {
        subconceptService.deleteSubconcept(subconceptId);
        return ResponseEntity.noContent().build();
    }
}
