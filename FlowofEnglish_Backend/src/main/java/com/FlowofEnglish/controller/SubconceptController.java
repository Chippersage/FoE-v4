package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.service.SubconceptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/subconcepts")
public class SubconceptController {

    @Autowired
    private SubconceptService subconceptService;

    @GetMapping("/all")
    public List<Subconcept> getAllSubconcept() {
        return subconceptService.getAllSubconcept();
    }
    @GetMapping
    public List<SubconceptResponseDTO> getAllSubconcepts() {
        return subconceptService.getAllSubconcepts();
    }

    @GetMapping("/{subconceptId}")
    public ResponseEntity<SubconceptResponseDTO> getSubconceptById(@PathVariable String subconceptId) {
        Optional<SubconceptResponseDTO> subconcept = subconceptService.getSubconceptById(subconceptId);
        return subconcept.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/create")
    public Subconcept createSubconcept(@RequestBody Subconcept subconcept) {
        return subconceptService.createSubconcept(subconcept);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadSubconcepts(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = subconceptService.uploadSubconceptsCSV(file);
        return ResponseEntity.ok(response);
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
