package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.model.Concept;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.model.Subconcept;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface ProgramConceptsMappingService {
	Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String userId, String unitId);
	
    List<ProgramConceptsMapping> getAllProgramConceptsMappings();
    
    Optional<ProgramConceptsMapping> getProgramConceptsMappingById(Long programConceptId);
    ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping);
    
    ResponseEntity<Map<String, Object>> bulkUpload(MultipartFile file);
    
    ProgramConceptsMapping updateProgramConceptsMapping(Long programConceptId, ProgramConceptsMapping programConceptsMapping);
    void deleteProgramConceptsMapping(Long programConceptId);

	Map<Concept, List<Subconcept>> getConceptsAndSubconceptsByProgram(String programId);

	List<Concept> getAllConceptsInProgram(String programId);

	Map<String, Object> getConceptsAndUserProgress(String programId, String userId);
	
	ResponseEntity<Map<String, Object>> bulkUpdate(MultipartFile file);

}
