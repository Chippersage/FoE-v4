package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.service.ProgramConceptsMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
