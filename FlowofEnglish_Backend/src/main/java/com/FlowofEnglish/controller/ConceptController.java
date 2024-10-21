package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.Concept;
import com.FlowofEnglish.service.ConceptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/concepts")
public class ConceptController {

    @Autowired
    private ConceptService conceptService;

    @GetMapping
    public List<Concept> getAllConcepts() {
        return conceptService.getAllConcepts();
    }

    @GetMapping("/{conceptId}")
    public ResponseEntity<Concept> getConceptById(@PathVariable String conceptId) {
        Optional<Concept> concept = conceptService.getConceptById(conceptId);
        return concept.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public Concept createConcept(@RequestBody Concept concept) {
        return conceptService.createConcept(concept);
    }
    
    @PostMapping("/bulk-upload")
    public ResponseEntity<Map<String, Object>> bulkUploadConcepts(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = conceptService.bulkUploadConcepts(file);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{conceptId}")
    public ResponseEntity<Concept> updateConcept(@PathVariable String conceptId, @RequestBody Concept concept) {
        return ResponseEntity.ok(conceptService.updateConcept(conceptId, concept));
    }

    @DeleteMapping("/{conceptId}")
    public ResponseEntity<Void> deleteConcept(@PathVariable String conceptId) {
        conceptService.deleteConcept(conceptId);
        return ResponseEntity.noContent().build();
    }
}
