package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.model.ProgramConceptsMapping;

import java.util.List;
import java.util.Optional;

public interface ProgramConceptsMappingService {
	 Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String userId, String unitId);
	 //Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String unitId);
	 
    List<ProgramConceptsMapping> getAllProgramConceptsMappings();
    Optional<ProgramConceptsMapping> getProgramConceptsMappingById(String programConceptId);
    ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping);
    ProgramConceptsMapping updateProgramConceptsMapping(String programConceptId, ProgramConceptsMapping programConceptsMapping);
    void deleteProgramConceptsMapping(String programConceptId);
}
