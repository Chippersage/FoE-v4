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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
        
    	Logger logger = LoggerFactory.getLogger(this.getClass());
    	logger.info("Method getProgramConceptsMappingByUnitId started for userId: {} and unitId: {}", userId, unitId);

    	// Fetch user details
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
            	logger.error("User with userId: {} not found", userId);
                return new ResourceNotFoundException("User not found");
            });
        
        String userType = user.getUserType();
        logger.info("User found: {}, UserType: {}", user.getUserName(), userType);
        
    	// Fetch all mappings related to the unitId
        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitIdOrdered(unitId);

        if (mappings.isEmpty()) {
        	logger.warn("No mappings found for unitId: {}", unitId);
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
        
     // Fetch all UserSubConcepts for the user and unit to track completion
        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unitId);
     // Initialize a set to hold completed subconcept IDs for easier comparison
        Set<String> completedSubconceptIds = userSubConcepts.stream()
            .map(us -> us.getSubconcept().getSubconceptId())
            .collect(Collectors.toSet());
        logger.info("User has completed {} subconcepts for unitId: {}", completedSubconceptIds.size(), unitId);


     // Determine accessible subconcepts based on user type
        List<ProgramConceptsMapping> accessibleMappings = mappings.stream()
            .filter(mapping -> isSubconceptVisibleToUser(userType, mapping.getSubconcept()))
            .collect(Collectors.toList());
        
     // Initialize the sub_concepts map
        Map<String, SubconceptResponseDTO> subconcepts = new LinkedHashMap<>();
     //  int subconceptCount = 0;  // Variable to keep track of total subconcept count
        boolean hasPendingAssignments = false;
        boolean enableNextSubconcept = true; // Initially, the first subconcept is enabled
        int lastCompletedNormalIndex = -1;
        int currentIndex = 0;
     // First pass: find last completed normal concept
        for (int i = 0; i < accessibleMappings.size(); i++) {
            ProgramConceptsMapping mapping = accessibleMappings.get(i);
            Subconcept subconcept = mapping.getSubconcept();
            boolean isCompleted = completedSubconceptIds.contains(subconcept.getSubconceptId());
            boolean isAssignment = subconcept.getSubconceptType().toLowerCase().startsWith("assignment");
            
            if (isCompleted && !isAssignment) {
                lastCompletedNormalIndex = i;
            }
        }
        
        for (ProgramConceptsMapping mapping : accessibleMappings) {
            Subconcept subconcept = mapping.getSubconcept();
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
            boolean isAssignment = subconcept.getSubconceptType().toLowerCase().startsWith("assignment");

            // Determine completion status
            if (isCompleted) {
                subconceptResponseDTO.setCompletionStatus("yes");
                if (!isAssignment) {
                    enableNextSubconcept = true;
                }
            } else {
            if (isAssignment) {
            	 // Check if all previous concepts up to next assignment are completed
                boolean prevConceptsCompleted = true;
                int prevAssignmentIndex = -1;
                
                // Find previous assignment
                for (int i = currentIndex - 1; i >= 0; i--) {
                    if (accessibleMappings.get(i).getSubconcept().getSubconceptType()
                            .toLowerCase().startsWith("assignment")) {
                        prevAssignmentIndex = i;
                        break;
                    }
                }
                
             // Check completion of concepts between previous assignment and current
                for (int i = prevAssignmentIndex + 1; i < currentIndex; i++) {
                    Subconcept prev = accessibleMappings.get(i).getSubconcept();
                    if (!prev.getSubconceptType().toLowerCase().startsWith("assignment") &&
                        !completedSubconceptIds.contains(prev.getSubconceptId())) {
                        prevConceptsCompleted = false;
                        break;
                    }
                }
                
                if (prevConceptsCompleted) {
                    subconceptResponseDTO.setCompletionStatus("ignored");
                    hasPendingAssignments = true;
                } else {
                    subconceptResponseDTO.setCompletionStatus("disabled");
                }
            } else if (enableNextSubconcept) {
                subconceptResponseDTO.setCompletionStatus("incomplete");
                enableNextSubconcept = false;
            } else {
                subconceptResponseDTO.setCompletionStatus("disabled");
            }
        }
         // Add to the map with an appropriate key (like an index or ID)
        subconcepts.put(String.valueOf(currentIndex), subconceptResponseDTO);
        currentIndex++;
       // subconceptCount++;
    }
     // Update totalSubConceptCount based on accessible mappings
        int totalNonAssignmentSubConceptCount = (int) accessibleMappings.stream()
                .map(ProgramConceptsMapping::getSubconcept)
                .filter(sub -> !sub.getSubconceptType().toLowerCase().startsWith("assignment"))
                .count();
        
        // Calculate completedSubConceptCount based on accessible mappings
        long completedNonAssignmentSubConceptCount = accessibleMappings.stream()
                .map(ProgramConceptsMapping::getSubconcept)
                .filter(sub -> !sub.getSubconceptType().toLowerCase().startsWith("assignment"))
                .map(Subconcept::getSubconceptId)
                .filter(completedSubconceptIds::contains)
                .count();
        logger.info("Total non-assignment subconcepts: {}", totalNonAssignmentSubConceptCount);
        logger.info("Completed non-assignment subconcepts: {}", completedNonAssignmentSubConceptCount);

         // Check if all non-assignment subconcepts are completed
     //   boolean allSubconceptsCompleted = completedNonAssignmentSubConceptCount == totalNonAssignmentSubConceptCount;
       // System.out.println("Subconcept Count: " + subconceptCount);
        System.out.println("User Subconcepts Completed: " + completedSubconceptIds.size());

     // Determine unit completion status
        String unitCompletionStatus = "no";
        if (completedNonAssignmentSubConceptCount == totalNonAssignmentSubConceptCount) {
            unitCompletionStatus = hasPendingAssignments ? "Unit Completed without Assignments" : "yes";
        }
     
     // Add subconcept count and final completion status to the response
        responseDTO.setSubconceptCount(totalNonAssignmentSubConceptCount);
        responseDTO.setSubConcepts(subconcepts);
        responseDTO.setUnitCompletionStatus(unitCompletionStatus);
        logger.info("Method getProgramConceptsMappingByUnitId completed for userId: {} and unitId: {}", userId, unitId);
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