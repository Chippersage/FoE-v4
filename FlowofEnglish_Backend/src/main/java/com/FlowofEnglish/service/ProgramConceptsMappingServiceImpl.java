package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.exception.BulkUploadException;
import com.FlowofEnglish.exception.ResourceNotFoundException;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
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
import java.util.*;
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
    
    @Autowired
    private ConceptRepository conceptRepository;
    
    @Autowired
    private UserAttemptsRepository  userAttemptsRepository;
    
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
        responseDTO.setProgramConceptDesc(mappings.get(0).getProgramConceptDesc());
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
        	//  Validate required headers
            Set<String> headers = csvParser.getHeaderMap().keySet();
            List<String> requiredHeaders = List.of("ProgramId", "StageId", "UnitId", "SubconceptId", "programconcept_desc", "position");

            for (String header : requiredHeaders) {
                if (!headers.contains(header)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Missing required header: " + header
                            ));
                }
            }
               for (CSVRecord record : csvParser) {
                   try {
                       String programId = record.get("ProgramId");
                       String stageId = record.get("StageId");
                       String unitId = record.get("UnitId");
                       String subconceptId = record.get("SubconceptId");
                       String programConceptDesc = record.get("programconcept_desc");
                       String positionStr = record.get("position"); // New field
                       
                       //  Required fields check
                       if (Stream.of(programId, stageId, unitId, subconceptId).anyMatch(field -> field == null || field.isBlank())) {
                           errorMessages.add("Missing required fields in row: " + record.getRecordNumber());
                           failCount++;
                           continue;
                       }

                       //  Safer parsing for position
                       int position = 0;
                       if (positionStr != null && !positionStr.isBlank()) {
                           try {
                               position = Integer.parseInt(positionStr.trim());
                           } catch (NumberFormatException e) {
                               errorMessages.add("Invalid position value at row " + record.getRecordNumber());
                               failCount++;
                               continue;
                           }
                       }

                       //  Duplicate check (case-insensitive)
                       String mappingKey = String.format("%s_%s_%s_%s",
                               programId.toLowerCase(),
                               stageId.toLowerCase(),
                               unitId.toLowerCase(),
                               subconceptId.toLowerCase());

                       if (csvMappings.contains(mappingKey)) {
                           errorMessages.add("Duplicate mapping found in CSV: " + mappingKey);
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
     //  Optional: Rollback if any failure occurs
        if (failCount > 0) {
            throw new BulkUploadException("CSV processing failed with " + failCount + " failed rows. Rolling back.");
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
    
    @Override
    public Map<Concept, List<Subconcept>> getConceptsAndSubconceptsByProgram(String programId) {
        // Step 1: Retrieve all ProgramConceptsMapping entries for the given programId
        List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);

        // Step 2: Extract all unique subconcepts from the mappings
        Set<String> subconceptIds = programMappings.stream()
            .map(mapping -> mapping.getSubconcept().getSubconceptId())
            .collect(Collectors.toSet());

        // Step 3: Retrieve all subconcepts by their IDs
        List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);

        // Step 4: Group subconcepts by their parent concepts
        Map<Concept, List<Subconcept>> conceptSubconceptMap = new HashMap<>();
        for (Subconcept subconcept : subconcepts) {
            Concept concept = subconcept.getConcept();
            conceptSubconceptMap.computeIfAbsent(concept, k -> new ArrayList<>()).add(subconcept);
        }

        return conceptSubconceptMap;
    }

    @Override
    public List<Concept> getAllConceptsInProgram(String programId) {
        // Step 1: Retrieve all ProgramConceptsMapping entries for the given programId
        List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);

        // Step 2: Extract all unique subconcepts from the mappings
        Set<String> subconceptIds = programMappings.stream()
            .map(mapping -> mapping.getSubconcept().getSubconceptId())
            .collect(Collectors.toSet());

        // Step 3: Retrieve all subconcepts by their IDs
        List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);

        // Step 4: Extract all unique concepts from the subconcepts
        Set<Concept> concepts = subconcepts.stream()
            .map(Subconcept::getConcept)
            .collect(Collectors.toSet());

        return new ArrayList<>(concepts);
    }
    
    @Override
    public Map<String, Object> getConceptsAndUserProgress(String programId, String userId) {
        // Step 1: Retrieve all ProgramConceptsMapping entries for the given programId
        List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);

        // Step 2: Extract all unique subconcepts from the mappings
        Set<String> subconceptIds = programMappings.stream()
            .map(mapping -> mapping.getSubconcept().getSubconceptId())
            .collect(Collectors.toSet());

        // Step 3: Retrieve all subconcepts by their IDs
        List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);

        // Step 4: Retrieve user’s completed subconcepts
        Set<String> completedSubconceptIds = userSubConceptRepository.findCompletedSubconceptIdsByUser_UserId(userId);

     // Step 5: Retrieve user's best scores for each subconcept
        List<Object[]> userScoresList = userAttemptsRepository.findMaxScoresByUser(userId);
        Map<String, Integer> userMaxScoreMap = new HashMap<>();
        for (Object[] row : userScoresList) {
            String subId = (String) row[0];
            Integer maxScore = ((Number) row[1]).intValue();
            userMaxScoreMap.put(subId, maxScore);
        }
        
        // Prepare response list
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> conceptList = new ArrayList<>();
        
     // Step 6: Group subconcepts by concept
        Map<Concept, List<Subconcept>> conceptSubconceptMap = new HashMap<>();
        for (Subconcept subconcept : subconcepts) {
            Concept concept = subconcept.getConcept();
            conceptSubconceptMap.computeIfAbsent(concept, k -> new ArrayList<>()).add(subconcept);
        }
        
     // Step 7: Build concept data with score aggregation
        for (Map.Entry<Concept, List<Subconcept>> entry : conceptSubconceptMap.entrySet()) {
            Concept concept = entry.getKey();
            List<Subconcept> subconceptsInConcept = entry.getValue();

            int totalSubconcepts = subconceptsInConcept.size();
            int completedSubconcepts = (int) subconceptsInConcept.stream()
                .filter(sub -> completedSubconceptIds.contains(sub.getSubconceptId()))
                .count();
            
            // Sum the maximum possible score from each subconcept (if available)
            int totalMaxScore = subconceptsInConcept.stream()
                    .map(sub -> sub.getSubconceptMaxscore() != null ? sub.getSubconceptMaxscore() : 0)
                    .reduce(0, Integer::sum);

            // Sum the user's score across the subconcepts; if user didn't attempt, score is 0
            int userTotalScore = subconceptsInConcept.stream()
                    .mapToInt(sub -> userMaxScoreMap.getOrDefault(sub.getSubconceptId(), 0))
                    .sum();

            Map<String, Object> conceptData = new HashMap<>();
            conceptData.put("conceptId", concept.getConceptId());
            conceptData.put("conceptName", concept.getConceptName());
            conceptData.put("conceptSkill-1", concept.getConceptSkill1());
            conceptData.put("conceptSkill-2", concept.getConceptSkill2());
            conceptData.put("totalSubconcepts", totalSubconcepts);
            conceptData.put("completedSubconcepts", completedSubconcepts);
            conceptData.put("totalMaxScore", totalMaxScore);
            conceptData.put("userTotalScore", userTotalScore);

            conceptList.add(conceptData);
        }

        response.put("concepts", conceptList);
        return response;
    }

}