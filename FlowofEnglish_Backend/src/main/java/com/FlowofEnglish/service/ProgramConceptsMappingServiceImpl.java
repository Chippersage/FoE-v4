package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramConceptsMappingResponseDTO;
import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.exception.ResourceNotFoundException;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import com.FlowofEnglish.repository.ProgramRepository;
import com.FlowofEnglish.repository.StageRepository;
import com.FlowofEnglish.repository.SubconceptRepository;
import com.FlowofEnglish.repository.UnitRepository;
import com.FlowofEnglish.repository.UserRepository;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import jakarta.transaction.Transactional;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStreamReader;
import java.io.Reader;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProgramConceptsMappingServiceImpl implements ProgramConceptsMappingService {

    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;
    
    @Autowired
    private UserSubConceptRepository userSubConceptRepository; 
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private StageRepository stageRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private SubconceptRepository subconceptRepository;
    
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
        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitIdOrdered(unitId);
//        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitId(unitId);

        if (mappings.isEmpty()) {
            return Optional.empty();
        }

        // Build the response DTO
        ProgramConceptsMappingResponseDTO responseDTO = new ProgramConceptsMappingResponseDTO();
        // Fetch and set programName, unitName, and stageName
        responseDTO.setProgramId(mappings.get(0).getProgram().getProgramId());
        responseDTO.setProgramName(mappings.get(0).getProgram().getProgramName());
        responseDTO.setUnitId(unitId);
        responseDTO.setUnitName(mappings.get(0).getUnit().getUnitName());
        responseDTO.setUnitDesc(mappings.get(0).getUnit().getUnitDesc());
        responseDTO.setStageId(mappings.get(0).getStage().getStageId()); 
        responseDTO.setStageName(mappings.get(0).getStage().getStageName());

        // Set stageId (assuming all mappings belong to the same stage)
        responseDTO.setStageId(mappings.get(0).getStage().getStageId()); 

        // Initialize the sub_concepts map
        Map<String, SubconceptResponseDTO> subconcepts = new LinkedHashMap<>();
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
        responseDTO.setSubconceptCount(subconceptCount);
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
    @Transactional
    public ResponseEntity<Map<String, Object>> bulkUpload(MultipartFile file) {
        List<String> errorMessages = new ArrayList<>();
        Set<String> csvMappings = new HashSet<>(); // To track unique Program-Concept mappings
        int successCount = 0;
        int failCount = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream());
                org.apache.commons.csv.CSVParser csvParser = new org.apache.commons.csv.CSVParser(reader, 
                   CSVFormat.DEFAULT.builder()
                       .setHeader()
                       .setSkipHeaderRecord(true)
                       .build())) {

               for (CSVRecord record : csvParser) {
                   try {
                       String programId = record.get("ProgramId");
                       String stageId = record.get("StageId");
                       String unitId = record.get("UnitId");
                       String subconceptId = record.get("SubconceptId");
                       String programConceptDesc = record.get("programconcept_desc");
                       String positionStr = record.get("position"); // New field
                       
                       // Parse or default the position
                       Integer position = (positionStr != null && !positionStr.isBlank())
                           ? Integer.parseInt(positionStr)
                           : 0; // Default to 0 if not provided


                       // Validate required fields
                       if (Stream.of(programId, stageId, unitId, subconceptId)
                               .anyMatch(field -> field == null || field.trim().isEmpty())) {
                           errorMessages.add("Missing required fields in row: " + record.getRecordNumber());
                           failCount++;
                           continue;
                       }

                       // Check for duplicate mapping
                       String mappingKey = String.format("%s_%s_%s_%s", programId, stageId, unitId, subconceptId);
                       if (csvMappings.contains(mappingKey)) {
                           errorMessages.add("Duplicate mapping found: " + mappingKey);
                           failCount++;
                           continue;
                       }

                       // Validate entity existence
                       Program program = programRepository.findById(programId)
                           .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + programId));
                       Stage stage = stageRepository.findById(stageId)
                           .orElseThrow(() -> new ResourceNotFoundException("Stage not found: " + stageId));
                       Unit unit = unitRepository.findById(unitId)
                           .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));
                       Subconcept subconcept = subconceptRepository.findById(subconceptId)
                           .orElseThrow(() -> new ResourceNotFoundException("Subconcept not found: " + subconceptId));

                       // Create new mapping
                       ProgramConceptsMapping newMapping = new ProgramConceptsMapping();
                       newMapping.setProgram(program);
                       newMapping.setStage(stage);
                       newMapping.setUnit(unit);
                       newMapping.setSubconcept(subconcept);
                       newMapping.setProgramConceptDesc(programConceptDesc);
                       newMapping.setPosition(position);
                       newMapping.setUuid(UUID.randomUUID().toString());

                       programConceptsMappingRepository.save(newMapping);
                       csvMappings.add(mappingKey);
                       successCount++;

                   } catch (ResourceNotFoundException e) {
                       errorMessages.add(e.getMessage());
                       failCount++;
                   } catch (Exception e) {
                       errorMessages.add("Error processing row " + record.getRecordNumber() + ": " + e.getMessage());
                       failCount++;
                   }
               }

           } catch (IOException e) {
               errorMessages.add("Error reading CSV file: " + e.getMessage());
               return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                   .body(Map.of(
                       "success", false,
                       "message", "Failed to process CSV file",
                       "error", e.getMessage()
                   ));
           }

           Map<String, Object> response = new HashMap<>();
           response.put("successCount", successCount);
           response.put("failCount", failCount);
           response.put("errors", errorMessages);
           
           return ResponseEntity.ok(response);
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