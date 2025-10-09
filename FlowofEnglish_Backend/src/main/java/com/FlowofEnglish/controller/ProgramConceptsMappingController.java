package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.service.ProgramConceptsMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1/programconceptsmappings")
public class ProgramConceptsMappingController {

    @Autowired
    private ProgramConceptsMappingService programConceptsMappingService;

    @GetMapping
    public List<ProgramConceptsMapping> getAllProgramConceptsMappings() {
        return programConceptsMappingService.getAllProgramConceptsMappings();
    }

    @GetMapping("/{programConceptId}")
    public ResponseEntity<ProgramConceptsMapping> getProgramConceptsMappingById(@PathVariable Long programConceptId) {
        Optional<ProgramConceptsMapping> programConceptsMapping = programConceptsMappingService.getProgramConceptsMappingById(programConceptId);
        return programConceptsMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("{userId}/unit/{unitId}")
    public ResponseEntity<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnit_UnitId(@PathVariable String userId, @PathVariable String unitId) {
        Optional<ProgramConceptsMappingResponseDTO> programConceptsMappingResponseDTO = programConceptsMappingService.getProgramConceptsMappingByUnitId(userId, unitId);
        return programConceptsMappingResponseDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ProgramConceptsMapping createProgramConceptsMapping(@RequestBody ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingService.createProgramConceptsMapping(programConceptsMapping);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> bulkUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "Please upload a CSV file",
                    "error", "No file provided"
                ));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("text/csv")) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "Please upload a CSV file",
                    "error", "Invalid file type"
                ));
        }

        return programConceptsMappingService.bulkUpload(file);
    }
    
 
    @PutMapping("/bulk-update")
    public ResponseEntity<Map<String, Object>> bulkUpdate(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please upload a CSV file",
                    "error", "No file provided"
            ));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("text/csv")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please upload a CSV file",
                    "error", "Invalid file type"
            ));
        }

        return programConceptsMappingService.bulkUpdate(file);
    }

    
    @PutMapping("/{programConceptId}")
    public ResponseEntity<ProgramConceptsMapping> updateProgramConceptsMapping(@PathVariable Long programConceptId, @RequestBody ProgramConceptsMapping programConceptsMapping) {
        return ResponseEntity.ok(programConceptsMappingService.updateProgramConceptsMapping(programConceptId, programConceptsMapping));
    }

    @DeleteMapping("/{programConceptId}")
    public ResponseEntity<Void> deleteProgramConceptsMapping(@PathVariable Long programConceptId) {
        programConceptsMappingService.deleteProgramConceptsMapping(programConceptId);
        return ResponseEntity.noContent().build();
    }
}
