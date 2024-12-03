package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.exception.ResourceNotFoundException;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import com.FlowofEnglish.repository.UserRepository;
import com.FlowofEnglish.repository.UserSubConceptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProgramConceptsMappingServiceImpl implements ProgramConceptsMappingService {

    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;
    
    @Autowired
    private UserSubConceptRepository userSubConceptRepository; 
    
    @Autowired
    private UserRepository userRepository;
    
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
        
    	// Fetch user details
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String userType = user.getUserType();
        
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
        responseDTO.setStageId(mappings.get(0).getStage().getStageId()); 

        // Initialize the sub_concepts map
        Map<String, SubconceptResponseDTO> subconcepts = new HashMap<>();
        int subconceptCount = 0;  // Variable to keep track of total subconcept count
        
     // Fetch all UserSubConcepts for the user and unit to track completion
        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unitId);
        
     // Initialize a set to hold completed subconcept IDs for easier comparison
        Set<String> completedSubconceptIds = userSubConcepts.stream()
            .map(us -> us.getSubconcept().getSubconceptId())
            .collect(Collectors.toSet());

     // Determine accessible subconcepts based on user type
        List<ProgramConceptsMapping> accessibleMappings = mappings.stream()
            .filter(mapping -> isSubconceptVisibleToUser(userType, mapping.getSubconcept()))
            .collect(Collectors.toList());

        // Update totalSubConceptCount based on accessible mappings
        int totalSubConceptCount = accessibleMappings.size();

        // Calculate completedSubConceptCount based on accessible mappings
        long completedSubConceptCount = accessibleMappings.stream()
            .map(ProgramConceptsMapping::getSubconcept)
            .map(Subconcept::getSubconceptId)
            .filter(completedSubconceptIds::contains)
            .count();
        
     // Keep track of the enabled state of subconcepts
        boolean enableNextSubconcept = true; // Initially, the first subconcept is enabled
        
        for (ProgramConceptsMapping mapping : accessibleMappings) {
            Subconcept subconcept = mapping.getSubconcept();
            
//         // Check visibility rules based on user type
//            if ("student".equalsIgnoreCase(userType) && !"student".equalsIgnoreCase(subconcept.getShowTo())) {
//                continue; // Skip subconcepts not meant for learners
//            }

            SubconceptResponseDTO subconceptResponseDTO = new SubconceptResponseDTO();
            subconceptResponseDTO.setSubconceptId(mapping.getSubconcept().getSubconceptId());
            subconceptResponseDTO.setSubconceptDesc(mapping.getSubconcept().getSubconceptDesc());
            subconceptResponseDTO.setSubconceptDesc2(mapping.getSubconcept().getSubconceptDesc2());
            subconceptResponseDTO.setSubconceptType(mapping.getSubconcept().getSubconceptType());
            subconceptResponseDTO.setSubconceptLink(mapping.getSubconcept().getSubconceptLink());
            subconceptResponseDTO.setDependency(mapping.getSubconcept().getDependency());
            subconceptResponseDTO.setSubconceptMaxscore(mapping.getSubconcept().getSubconceptMaxscore());
            subconceptResponseDTO.setNumQuestions(mapping.getSubconcept().getNumQuestions());
            subconceptResponseDTO.setShowTo(mapping.getSubconcept().getShowTo());
            subconceptResponseDTO.setSubconceptGroup(mapping.getSubconcept().getSubconceptGroup());
            
         
            // Check if the current subconcept has been completed by the user
            boolean isCompleted = completedSubconceptIds.contains(mapping.getSubconcept().getSubconceptId());

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
            
            subconceptCount++;
//         // Increment the count only for learners when applicable
//            if ("student".equalsIgnoreCase(userType)) {
//                subconceptCount++;
//            }
        }
//     // Adjust total subconcept count for mentors
//        if ("teacher".equalsIgnoreCase(userType)) {
//            subconceptCount = mappings.size();
//        }
     // Check if all subconcepts are completed to mark the unit as completed
    // boolean allSubconceptsCompleted = completedSubconceptIds.size() == subconceptCount;
        boolean allSubconceptsCompleted = completedSubConceptCount == totalSubConceptCount;
        System.out.println("Subconcept Count: " + subconceptCount);
        System.out.println("User Subconcepts Completed: " + completedSubconceptIds.size());

     
        // Add subconcept count to the response
        responseDTO.setSubconceptCount(subconceptCount); // Total number of subconcepts for this unit
        responseDTO.setSubConcepts(subconcepts);
        responseDTO.setUnitCompletionStatus(allSubconceptsCompleted ? "yes" : "no");

        return Optional.of(responseDTO);
    }
    /**
     * Helper method to determine if a subconcept is visible to the user based on user type.
     */
    private boolean isSubconceptVisibleToUser(String userType, Subconcept subconcept) {
        // Assuming 'showTo' can have multiple values separated by commas, e.g., "student,teacher"
        Set<String> visibilitySet = Arrays.stream(subconcept.getShowTo().split(","))
                                         .map(String::trim)
                                         .map(String::toLowerCase)
                                         .collect(Collectors.toSet());
        return visibilitySet.contains(userType.toLowerCase());
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