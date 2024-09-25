package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProgramConceptsMappingServiceImpl implements ProgramConceptsMappingService {

    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;

    @Override
    public List<ProgramConceptsMapping> getAllProgramConceptsMappings() {
        return programConceptsMappingRepository.findAll();
    }

    @Override
    public Optional<ProgramConceptsMapping> getProgramConceptsMappingById(String programConceptId) {
        return programConceptsMappingRepository.findById(programConceptId);
    }
    
    @Override
    public Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String unitId) {
        // Fetch all mappings related to the unitId
        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitId(unitId);

        if (mappings.isEmpty()) {
            return Optional.empty();
        }

        // Build the response DTO
        ProgramConceptsMappingResponseDTO responseDTO = new ProgramConceptsMappingResponseDTO();
        responseDTO.setProgramId(mappings.get(0).getProgram().getProgramId());
        responseDTO.setUnit_id(unitId);

        // Set stageId (assuming all mappings belong to the same stage)
        responseDTO.setStageId(mappings.get(0).getStage().getStageId()); // Adjust according to your entity structure

        // Initialize the sub_concepts map
        Map<String, SubconceptResponseDTO> subconcepts = new HashMap<>();

        // Populate the sub_concepts based on mappings
        for (ProgramConceptsMapping mapping : mappings) {
            SubconceptResponseDTO subconceptResponseDTO = new SubconceptResponseDTO();
            subconceptResponseDTO.setSubconceptId(mapping.getSubconcept().getSubconceptId());
            subconceptResponseDTO.setSubconceptDesc(mapping.getSubconcept().getSubconceptDesc());
            subconceptResponseDTO.setSubconceptType(mapping.getSubconcept().getSubconceptType());
            subconceptResponseDTO.setSubconceptLink(mapping.getSubconcept().getSubconceptLink());
            // Set completion status based on your logic
            subconceptResponseDTO.setCompletionStatus("yes"); // Update accordingly
            
            subconceptResponseDTO.setDependency(mapping.getSubconcept().getDependency());
            subconceptResponseDTO.setShowTo(mapping.getSubconcept().getShowTo());
            subconceptResponseDTO.setSubconceptGroup(mapping.getSubconcept().getSubconceptGroup());
            subconceptResponseDTO.setSubconceptTitle(mapping.getSubconcept().getSubconceptTitle());

            // Add to the map with an appropriate key (like an index or ID)
            subconcepts.put(String.valueOf(subconcepts.size()), subconceptResponseDTO);
        }

        responseDTO.setSub_concepts(subconcepts);
        responseDTO.setUnit_completion_status("no"); // Update according to your logic

        return Optional.of(responseDTO);
    }


    @Override
    public ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.save(programConceptsMapping);
    }

    @Override
    public ProgramConceptsMapping updateProgramConceptsMapping(String programConceptId, ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.findById(programConceptId).map(existingMapping -> {
            existingMapping.setProgramConceptDesc(programConceptsMapping.getProgramConceptDesc());
            //existingMapping.setConcept(programConceptsMapping.getConcept());
            //existingMapping.setContent(programConceptsMapping.getContent());
            existingMapping.setStage(programConceptsMapping.getStage());
            existingMapping.setUnit(programConceptsMapping.getUnit());
            existingMapping.setProgram(programConceptsMapping.getProgram());
            existingMapping.setSubconcept(programConceptsMapping.getSubconcept());
            return programConceptsMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("ProgramConceptsMapping not found"));
    }

    @Override
    public void deleteProgramConceptsMapping(String programConceptId) {
        programConceptsMappingRepository.deleteById(programConceptId);
    }
}

