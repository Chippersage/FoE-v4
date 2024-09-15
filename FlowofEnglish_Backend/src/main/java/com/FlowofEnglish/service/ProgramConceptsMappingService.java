package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ProgramConceptsMapping;

import java.util.List;
import java.util.Optional;

public interface ProgramConceptsMappingService {
    List<ProgramConceptsMapping> getAllProgramConceptsMappings();
    Optional<ProgramConceptsMapping> getProgramConceptsMappingById(String programConceptId);
    ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping);
    ProgramConceptsMapping updateProgramConceptsMapping(String programConceptId, ProgramConceptsMapping programConceptsMapping);
    void deleteProgramConceptsMapping(String programConceptId);
}
