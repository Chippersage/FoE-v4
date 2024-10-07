package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import com.FlowofEnglish.repository.UserSubConceptRepository;

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
    
    @Autowired
    private UserSubConceptRepository userSubConceptRepository; // Inject the repository
    
    @Override
    public List<ProgramConceptsMapping> getAllProgramConceptsMappings() {
        return programConceptsMappingRepository.findAll();
    }

    @Override
    public Optional<ProgramConceptsMapping> getProgramConceptsMappingById(Long programConceptId) {
        return programConceptsMappingRepository.findById(programConceptId);
    }
    
    @Override
    public Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String userId, String unitId) {
        // Fetch all mappings related to the unitId
        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitId(unitId);

        if (mappings.isEmpty()) {
            return Optional.empty();
        }

        // Build the response DTO
        ProgramConceptsMappingResponseDTO responseDTO = new ProgramConceptsMappingResponseDTO();
        responseDTO.setProgramId(mappings.get(0).getProgram().getProgramId());
        responseDTO.setUnitId(unitId);

        // Set stageId (assuming all mappings belong to the same stage)
        responseDTO.setStageId(mappings.get(0).getStage().getStageId()); // Adjust according to your entity structure

        // Initialize the sub_concepts map
        Map<String, SubconceptResponseDTO> subconcepts = new HashMap<>();
        int subconceptCount = 0;  // Variable to keep track of total subconcept count
        
     // Fetch all UserSubConcepts for the user and unit to track completion
        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unitId);
        
     // Keep track of the enabled state of subconcepts
        boolean enableNextSubconcept = true; // Initially, the first subconcept is enabled

        // Populate the sub_concepts based on mappings
        for (ProgramConceptsMapping mapping : mappings) {
            SubconceptResponseDTO subconceptResponseDTO = new SubconceptResponseDTO();
            subconceptResponseDTO.setSubconceptId(mapping.getSubconcept().getSubconceptId());
            subconceptResponseDTO.setSubconceptDesc(mapping.getSubconcept().getSubconceptDesc());
            subconceptResponseDTO.setSubconceptType(mapping.getSubconcept().getSubconceptType());
            subconceptResponseDTO.setSubconceptLink(mapping.getSubconcept().getSubconceptLink());
            subconceptResponseDTO.setDependency(mapping.getSubconcept().getDependency());
            subconceptResponseDTO.setShowTo(mapping.getSubconcept().getShowTo());
            subconceptResponseDTO.setSubconceptGroup(mapping.getSubconcept().getSubconceptGroup());
            subconceptResponseDTO.setSubconceptTitle(mapping.getSubconcept().getSubconceptTitle());
         
         // Check if the current subconcept has been completed by the user
            boolean isCompleted = userSubConcepts.stream()
                .anyMatch(us -> us.getSubconcept().getSubconceptId().equals(mapping.getSubconcept().getSubconceptId()));

            if (isCompleted) {
                subconceptResponseDTO.setCompletionStatus("yes");
                enableNextSubconcept = true; // Enable the next subconcept if the current one is completed
            } else if (enableNextSubconcept) {
                // The next subconcept to be completed
                subconceptResponseDTO.setCompletionStatus("incomplete"); // Mark it as incomplete but enabled
                enableNextSubconcept = false; // Disable all following subconcepts
            } else {
                subconceptResponseDTO.setCompletionStatus("disabled"); // This subconcept is disabled until the previous one is completed
            }

            // Add to the map with an appropriate key (like an index or ID)
            subconcepts.put(String.valueOf(subconcepts.size()), subconceptResponseDTO);
            
         // Increment the subconcept count
            subconceptCount++;
        }
     // Check if all subconcepts are completed to mark the unit as completed
        boolean allSubconceptsCompleted = userSubConcepts.size() == subconceptCount;

     
        // Add subconcept count to the response
        responseDTO.setSubconceptCount(subconceptCount); // Total number of subconcepts for this unit
        responseDTO.setSubConcepts(subconcepts);
        responseDTO.setUnitCompletionStatus(allSubconceptsCompleted ? "yes" : "no");

        return Optional.of(responseDTO);
    }


    @Override
    public ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.save(programConceptsMapping);
    }

    @Override
    public ProgramConceptsMapping updateProgramConceptsMapping(Long programConceptId, ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.findById(programConceptId).map(existingMapping -> {
            existingMapping.setProgramConceptDesc(programConceptsMapping.getProgramConceptDesc());
            existingMapping.setStage(programConceptsMapping.getStage());
            existingMapping.setUnit(programConceptsMapping.getUnit());
            existingMapping.setProgram(programConceptsMapping.getProgram());
            existingMapping.setSubconcept(programConceptsMapping.getSubconcept());
            return programConceptsMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("ProgramConceptsMapping not found"));
    }

    @Override
    public void deleteProgramConceptsMapping(Long programConceptId) {
        programConceptsMappingRepository.deleteById(programConceptId);
    }
}

