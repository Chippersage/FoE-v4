package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.exception.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.springframework.cache.annotation.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.*;
import org.apache.commons.csv.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.*;
import java.util.stream.*;
import org.slf4j.*;

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
    private UnitService unitService;
    
    @Autowired
    private SubconceptRepository subconceptRepository;
    
    @Autowired
    private UserAttemptsRepository  userAttemptsRepository;
    
    @Autowired
    private CloudFrontSignedUrlService cloudFrontSignedUrlService;
    
 // Inject CloudFront domain from application.properties
    @Value("${cloudfront.domain}")
    private String cloudFrontDomain;
    
    private static final Logger logger = LoggerFactory.getLogger(ProgramConceptsMappingServiceImpl.class);
    
//    private static final Set<String> DEMO_USER_ALLOWED_UNITS = Set.of("L1-W1-U03", "L1-W2-U01");
//    private static final Set<String> DEMO_USERS = Set.of("Sachin10", "JohnDoe", "Joshson");
//    private boolean isDemoUser(String userId) { return userId != null && DEMO_USERS.stream().anyMatch(u -> u.equalsIgnoreCase(userId)); }

    
     // Helper method to process subconceptLink and generate signed URLs when needed
    private String processSubconceptLink(String subconceptLink) {
        if (subconceptLink == null || subconceptLink.trim().isEmpty()) {
            return subconceptLink;
        }
        
        try {
            // Check if the link is a path (starts with / and doesn't contain http)
            if (subconceptLink.startsWith("/") && !subconceptLink.toLowerCase().startsWith("http")) {
                logger.debug("Processing path for signed URL: {}", subconceptLink);
                // This is a path, generate signed URL
                return cloudFrontSignedUrlService.generateSignedUrl(subconceptLink);
            }
            // Check if the link is already a CloudFront URL
            else if (subconceptLink.toLowerCase().startsWith(cloudFrontDomain.toLowerCase())) {
                logger.debug("Processing CloudFront URL for signed URL: {}", subconceptLink);
                // Extract the path from the CloudFront URL
                String path = subconceptLink.substring(cloudFrontDomain.length());
                if (!path.startsWith("/")) {
                    path = "/" + path;
                }
                return cloudFrontSignedUrlService.generateSignedUrl(path);
            }
            // Check if it's an S3 direct link or other external URL
            else if (subconceptLink.toLowerCase().startsWith("http")) {
                logger.debug("Returning external URL as-is: {}", subconceptLink);
                // This is an external URL (like S3 direct link), return as-is
                return subconceptLink;
            }
            else {
                logger.warn("Unrecognized link format: {}", subconceptLink);
                // Fallback: return as-is
                return subconceptLink;
            }
        } catch (Exception e) {
            logger.error("Error processing subconceptLink: {}, Error: {}", subconceptLink, e.getMessage());
            // If there's an error generating signed URL, return original link
            return subconceptLink;
        }
    }
    
    @Override
    @Cacheable(value = "programConceptsByUnit", key = "#userId + '_' + #unitId")
    public Optional<ProgramConceptsMappingResponseDTO> getProgramConceptsMappingByUnitId(String userId, String unitId) {
        try {
            logger.info("Method getProgramConceptsMappingByUnitId started for userId: {} and unitId: {}", userId, unitId);

            if (userId == null || userId.trim().isEmpty()) {
                logger.error("User ID is null or empty");
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }
            
            if (unitId == null || unitId.trim().isEmpty()) {
                logger.error("Unit ID is null or empty");
                throw new IllegalArgumentException("Unit ID cannot be null or empty");
            }

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

            logger.debug("Found {} mappings for unitId: {}", mappings.size(), unitId);

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
        
        logger.debug("Response DTO initialized with program: {}, unit: {}, stage: {}", 
                responseDTO.getProgramName(), responseDTO.getUnitName(), responseDTO.getStageName());
        
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
        logger.debug("Found {} accessible mappings for userType: {}", accessibleMappings.size(), userType);
        
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
        
        logger.debug("Last completed normal concept index: {}", lastCompletedNormalIndex); 
        
        for (ProgramConceptsMapping mapping : accessibleMappings) {
            Subconcept subconcept = mapping.getSubconcept();
            SubconceptResponseDTO subconceptResponseDTO = new SubconceptResponseDTO();
            subconceptResponseDTO.setSubconceptId(mapping.getSubconcept().getSubconceptId());
            subconceptResponseDTO.setSubconceptDesc(mapping.getSubconcept().getSubconceptDesc());
            subconceptResponseDTO.setSubconceptDesc2(mapping.getSubconcept().getSubconceptDesc2());
            subconceptResponseDTO.setSubconceptType(mapping.getSubconcept().getSubconceptType());
            //subconceptResponseDTO.setSubconceptLink(mapping.getSubconcept().getSubconceptLink());

            // Process the subconceptLink to handle signed URLs
            String originalLink = mapping.getSubconcept().getSubconceptLink();
            String processedLink = processSubconceptLink(originalLink);
            subconceptResponseDTO.setSubconceptLink(processedLink);
            
            logger.debug("Processed link for subconcept {}: {} -> {}", 
                    subconcept.getSubconceptId(), originalLink, processedLink);
            
            subconceptResponseDTO.setDependency(mapping.getSubconcept().getDependency());
            subconceptResponseDTO.setSubconceptMaxscore(mapping.getSubconcept().getSubconceptMaxscore());
            subconceptResponseDTO.setNumQuestions(mapping.getSubconcept().getNumQuestions());
            subconceptResponseDTO.setShowTo(mapping.getSubconcept().getShowTo());
            subconceptResponseDTO.setSubconceptGroup(mapping.getSubconcept().getSubconceptGroup());
            
            // Check if the current subconcept has been completed by the user
            boolean isCompleted = completedSubconceptIds.contains(mapping.getSubconcept().getSubconceptId());
            boolean isAssignment = subconcept.getSubconceptType().toLowerCase().startsWith("assignment");
            
            logger.debug("Processing subconcept {}: completed={}, isAssignment={}", 
                    subconcept.getSubconceptId(), isCompleted, isAssignment);

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
        logger.debug("User Subconcepts Completed: {}", completedSubconceptIds.size());

         // Check if all non-assignment subconcepts are completed
     //   boolean allSubconceptsCompleted = completedNonAssignmentSubConceptCount == totalNonAssignmentSubConceptCount;
       // System.out.println("Subconcept Count: " + subconceptCount);
        System.out.println("User Subconcepts Completed: " + completedSubconceptIds.size());

     // Determine unit completion status
        String unitCompletionStatus = "no";
        if (completedNonAssignmentSubConceptCount == totalNonAssignmentSubConceptCount) {
            unitCompletionStatus = hasPendingAssignments ? "Unit Completed without Assignments" : "yes";
        }
        logger.info("Unit completion status determined: {}", unitCompletionStatus);
        
     // Add subconcept count and final completion status to the response
        responseDTO.setSubconceptCount(totalNonAssignmentSubConceptCount);
        responseDTO.setSubConcepts(subconcepts);
        responseDTO.setUnitCompletionStatus(unitCompletionStatus);
        logger.info("Method getProgramConceptsMappingByUnitId completed for userId: {} and unitId: {}", userId, unitId);
        return Optional.of(responseDTO);
    }catch (ResourceNotFoundException | IllegalArgumentException e) {
        logger.error("Error in getProgramConceptsMappingByUnitId: {}", e.getMessage());
        throw e;
    } catch (Exception e) {
        logger.error("Unexpected error in getProgramConceptsMappingByUnitId for userId: {} and unitId: {}: {}", userId, unitId, e.getMessage(), e);
        throw new RuntimeException("Failed to get program concepts mapping by unit", e);
    }
}
    
     // Helper method to determine if a subconcept is visible to the user based on user type.
    private boolean isSubconceptVisibleToUser(String userType, Subconcept subconcept) {
        try {
            logger.debug("Checking visibility for subconcept {} with userType: {}", subconcept.getSubconceptId(), userType);
            
            // Assuming 'showTo' can have multiple values separated by commas, e.g., "student,teacher"
            Set<String> visibilitySet = Arrays.stream(subconcept.getShowTo().split(","))
                                                .map(String::trim)
                                                .map(String::toLowerCase)
                                                .collect(Collectors.toSet());
            
            boolean isVisible = visibilitySet.contains(userType.toLowerCase());
            logger.debug("Subconcept {} visibility result: {}", subconcept.getSubconceptId(), isVisible);
            
            return isVisible;
        } catch (Exception e) {
            logger.error("Error checking subconcept visibility for subconcept {}: {}", subconcept.getSubconceptId(), e.getMessage(), e);
            return false; // Default to not visible on error
        }
    }

    
    @Override
    @Cacheable(value = "programConceptsMappings", key = "'all'")
    public List<ProgramConceptsMapping> getAllProgramConceptsMappings() {
        try {
            logger.info("Retrieving all program concepts mappings from database");
            List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findAll();
            logger.info("Successfully retrieved {} program concepts mappings", mappings.size());
            return mappings;
        } catch (Exception e) {
            logger.error("Error occurred while retrieving all program concepts mappings: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve program concepts mappings", e);
        }
    }

    @Override
    @Cacheable(value = "programConceptsMappings", key = "#programConceptId")
    public Optional<ProgramConceptsMapping> getProgramConceptsMappingById(Long programConceptId) {
        try {
            logger.info("Retrieving program concepts mapping with ID: {}", programConceptId);
            
            if (programConceptId == null) {
                logger.warn("Program concept ID is null");
                throw new IllegalArgumentException("Program concept ID cannot be null");
            }
            
            Optional<ProgramConceptsMapping> mapping = programConceptsMappingRepository.findById(programConceptId);
            
            if (mapping.isPresent()) {
                logger.info("Successfully found program concepts mapping with ID: {}", programConceptId);
            } else {
                logger.warn("No program concepts mapping found with ID: {}", programConceptId);
            }
            
            return mapping;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for getProgramConceptsMappingById: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while retrieving program concepts mapping with ID {}: {}", programConceptId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve program concepts mapping", e);
        }
    }
    
    
    @Override
    @CacheEvict(value = {"programConceptsMappings", "programConceptsByUnit", "programConceptsByProgram", "conceptsByProgram", "conceptsAndProgress"}, allEntries = true)
    public ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping) {
        try {
            logger.info("Creating new program concepts mapping");
            
            if (programConceptsMapping == null) {
                logger.error("Program concepts mapping object is null");
                throw new IllegalArgumentException("Program concepts mapping cannot be null");
            }
            
            ProgramConceptsMapping savedMapping = programConceptsMappingRepository.save(programConceptsMapping);
            logger.info("Successfully created program concepts mapping with ID: {}", savedMapping.getProgramConceptId());
            
            return savedMapping;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for createProgramConceptsMapping: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while creating program concepts mapping: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create program concepts mapping", e);
        }
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"programConceptsMappings", "programConceptsByUnit", "programConceptsByProgram", "conceptsByProgram", "conceptsAndProgress"}, allEntries = true)
    public ResponseEntity<Map<String, Object>> bulkUpload(MultipartFile file) {
        List<String> errorMessages = new ArrayList<>();
        Set<String> csvMappings = new HashSet<>(); // To track unique Program-Concept mappings
        int successCount = 0;
        int failCount = 0;

        try {
            logger.info("Starting bulk upload process for file: {}", file.getOriginalFilename());
            
            if (file == null || file.isEmpty()) {
                logger.error("Uploaded file is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "success", false,
                                "message", "File cannot be null or empty"
                        ));
            }
            
        try (Reader reader = new InputStreamReader(file.getInputStream());
                org.apache.commons.csv.CSVParser csvParser = new org.apache.commons.csv.CSVParser(reader, 
                   CSVFormat.DEFAULT.builder()
                       .setHeader()
                       .setSkipHeaderRecord(true)
                       .build())) {
        	//  Validate required headers
            Set<String> headers = csvParser.getHeaderMap().keySet();
            List<String> requiredHeaders = List.of("ProgramId", "StageId", "UnitId", "SubconceptId", "programconcept_desc", "position");
            logger.debug("Validating CSV headers: {}", headers);
            
            for (String header : requiredHeaders) {
                if (!headers.contains(header)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Missing required header: " + header
                            ));
                }
            }
            
            logger.info("CSV headers validation passed, processing records");
            
               for (CSVRecord record : csvParser) {
                   try {
                       String programId = record.get("ProgramId");
                       String stageId = record.get("StageId");
                       String unitId = record.get("UnitId");
                       String subconceptId = record.get("SubconceptId");
                       String programConceptDesc = record.get("programconcept_desc");
                       String positionStr = record.get("position"); // New field
                       
                       logger.debug("Processing record {}: programId={}, stageId={}, unitId={}, subconceptId={}", 
                               record.getRecordNumber(), programId, stageId, unitId, subconceptId);
                    
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
                               logger.warn("Invalid position value '{}' at row {}", positionStr, record.getRecordNumber());
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
                           .orElseThrow(() -> {
                               logger.error("Program not found: {}", programId);
                               return new ResourceNotFoundException("Program not found: " + programId);
                           });
                       Stage stage = stageRepository.findById(stageId)
                           .orElseThrow(() -> {
                               logger.error("Stage not found: {}", stageId);
                               return new ResourceNotFoundException("Stage not found: " + stageId);
                           });
                       Unit unit = unitRepository.findById(unitId)
                           .orElseThrow(() -> {
                               logger.error("Unit not found: {}", unitId);
                               return new ResourceNotFoundException("Unit not found: " + unitId);
                           });
                       Subconcept subconcept = subconceptRepository.findById(subconceptId)
                           .orElseThrow(() -> {
                               logger.error("Subconcept not found: {}", subconceptId);
                               return new ResourceNotFoundException("Subconcept not found: " + subconceptId);
                           });
                       
                       
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

                       logger.debug("Successfully processed record {} for mapping: {}", record.getRecordNumber(), mappingKey);

                   } catch (ResourceNotFoundException e) {
                       logger.error("Resource not found error in row {}: {}", record.getRecordNumber(), e.getMessage());
                       errorMessages.add(e.getMessage());
                       failCount++;
                   } catch (Exception e) {
                       logger.error("Error processing row {}: {}", record.getRecordNumber(), e.getMessage(), e);
                       errorMessages.add("Error processing row " + record.getRecordNumber() + ": " + e.getMessage());
                       failCount++;
                   }
               }

           } catch (IOException e) {
               logger.error("Error reading CSV file: {}", e.getMessage(), e);
               errorMessages.add("Error reading CSV file: " + e.getMessage());
               return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                   .body(Map.of(
                       "success", false,
                       "message", "Failed to process CSV file",
                       "error", e.getMessage()
                   ));
           }
           
           // Optional: Rollback if any failure occurs
           if (failCount > 0) {
               logger.error("CSV processing failed with {} failed rows. Rolling back.", failCount);
               throw new BulkUploadException("CSV processing failed with " + failCount + " failed rows. Rolling back.");
           }

           logger.info("Bulk upload completed successfully. Success count: {}, Fail count: {}", successCount, failCount);

           Map<String, Object> response = new HashMap<>();
           response.put("successCount", successCount);
           response.put("failCount", failCount);
           response.put("errors", errorMessages);
           
           return ResponseEntity.ok(response);
           
       } catch (BulkUploadException e) {
           logger.error("Bulk upload exception: {}", e.getMessage());
           throw e;
       } catch (Exception e) {
           logger.error("Unexpected error during bulk upload: {}", e.getMessage(), e);
           throw new RuntimeException("Failed to process bulk upload", e);
       }
   }
    
    
    @Override
    @CachePut(value = "programConceptsMappings", key = "#programConceptId")
    @CacheEvict(value = {"programConceptsByUnit", "programConceptsByProgram", "conceptsByProgram", "conceptsAndProgress"}, allEntries = true)
    public ProgramConceptsMapping updateProgramConceptsMapping(Long programConceptId, ProgramConceptsMapping programConceptsMapping) {
        try {
            logger.info("Updating program concepts mapping with ID: {}", programConceptId);
            
            if (programConceptId == null) {
                logger.error("Program concept ID is null for update");
                throw new IllegalArgumentException("Program concept ID cannot be null");
            }
            
            if (programConceptsMapping == null) {
                logger.error("Updated program concepts mapping object is null");
                throw new IllegalArgumentException("Updated program concepts mapping cannot be null");
            }
            
            return programConceptsMappingRepository.findById(programConceptId).map(existingMapping -> {
                logger.debug("Found existing mapping with ID: {}, updating fields", programConceptId);
                
                existingMapping.setProgramConceptDesc(programConceptsMapping.getProgramConceptDesc());
                existingMapping.setStage(programConceptsMapping.getStage());
                existingMapping.setUnit(programConceptsMapping.getUnit());
                existingMapping.setProgram(programConceptsMapping.getProgram());
                existingMapping.setSubconcept(programConceptsMapping.getSubconcept());
                
                ProgramConceptsMapping savedMapping = programConceptsMappingRepository.save(existingMapping);
                logger.info("Successfully updated program concepts mapping with ID: {}", programConceptId);
                
                return savedMapping;
            }).orElseThrow(() -> {
                logger.error("Program concepts mapping not found with ID: {} for update", programConceptId);
                return new RuntimeException("ProgramConceptsMapping not found");
            });
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for updateProgramConceptsMapping: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while updating program concepts mapping with ID {}: {}", programConceptId, e.getMessage(), e);
            throw new RuntimeException("Failed to update program concepts mapping", e);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {"programConceptsMappings", "programConceptsByUnit", "programConceptsByProgram", "conceptsByProgram", "conceptsAndProgress"}, allEntries = true)
    public ResponseEntity<Map<String, Object>> bulkUpdate(MultipartFile file) {
        List<String> errorMessages = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .build())) {

            // Validate headers
            Set<String> headers = csvParser.getHeaderMap().keySet();
            List<String> requiredHeaders = List.of("ProgramId", "StageId", "UnitId", "SubconceptId", "programconcept_desc", "position");

            for (String header : requiredHeaders) {
                if (!headers.contains(header)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("success", false, "message", "Missing required header: " + header));
                }
            }

            for (CSVRecord record : csvParser) {
                try {
                    String programId = record.get("ProgramId").trim();
                    String stageId = record.get("StageId").trim();
                    String unitId = record.get("UnitId").trim();
                    String subconceptId = record.get("SubconceptId").trim();
                    String programConceptDesc = record.get("programconcept_desc").trim();
                    String positionStr = record.get("position").trim();

                    int newPosition = positionStr.isEmpty() ? 0 : Integer.parseInt(positionStr);

                    Program program = programRepository.findById(programId)
                            .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + programId));
                    Stage stage = stageRepository.findById(stageId)
                            .orElseThrow(() -> new ResourceNotFoundException("Stage not found: " + stageId));
                    Unit unit = unitRepository.findById(unitId)
                            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + unitId));
                    Subconcept subconcept = subconceptRepository.findById(subconceptId)
                            .orElseThrow(() -> new ResourceNotFoundException("Subconcept not found: " + subconceptId));

                    // Find existing mapping
                    Optional<ProgramConceptsMapping> existingOpt = programConceptsMappingRepository.findAll().stream()
                            .filter(m -> m.getProgram().getProgramId().equals(programId)
                                    && m.getStage().getStageId().equals(stageId)
                                    && m.getSubconcept().getSubconceptId().equals(subconceptId))
                            .findFirst();

                    if (existingOpt.isPresent()) {
                        // ✅ Update existing record
                        ProgramConceptsMapping existing = existingOpt.get();
                        existing.setUnit(unit);
                        existing.setPosition(newPosition);
                        existing.setProgramConceptDesc(programConceptDesc);
                        programConceptsMappingRepository.save(existing);
                        successCount++;
                    } else {
                        // ❌ No record found, skip or optionally create new
                        errorMessages.add("Mapping not found for ProgramId=" + programId +
                                ", StageId=" + stageId + ", SubconceptId=" + subconceptId);
                        failCount++;
                    }

                } catch (Exception e) {
                    errorMessages.add("Error at row " + record.getRecordNumber() + ": " + e.getMessage());
                    failCount++;
                }
            }

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error reading CSV: " + e.getMessage()));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errorMessages);

        return ResponseEntity.ok(result);
    }

    
    @Override
    @CacheEvict(value = {"programConceptsMappings", "programConceptsByUnit", "programConceptsByProgram", "conceptsByProgram", "conceptsAndProgress"}, allEntries = true)
    public void deleteProgramConceptsMapping(Long programConceptId) {
        try {
            logger.info("Deleting program concepts mapping with ID: {}", programConceptId);
            
            if (programConceptId == null) {
                logger.error("Program concept ID is null for deletion");
                throw new IllegalArgumentException("Program concept ID cannot be null");
            }
            
            if (!programConceptsMappingRepository.existsById(programConceptId)) {
                logger.warn("Program concepts mapping not found with ID: {} for deletion", programConceptId);
                throw new IllegalArgumentException("Program concepts mapping not found with ID: " + programConceptId);
            }
            
            programConceptsMappingRepository.deleteById(programConceptId);
            logger.info("Successfully deleted program concepts mapping with ID: {}", programConceptId);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for deleteProgramConceptsMapping: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error occurred while deleting program concepts mapping with ID {}: {}", programConceptId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete program concepts mapping", e);
        }
    }
    
    @Override
    @Cacheable(value = "programConceptsByProgram", key = "#programId")
    public Map<Concept, List<Subconcept>> getConceptsAndSubconceptsByProgram(String programId) {
        try {
            logger.info("Retrieving concepts and subconcepts for program ID: {}", programId);

            if (programId == null || programId.trim().isEmpty()) {
                logger.error("Program ID is null or empty");
                throw new IllegalArgumentException("Program ID cannot be null or empty");
            }

            // Step 1: Retrieve all ProgramConceptsMapping entries for the given programId
            List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);
            logger.debug("Found {} program mappings for program ID: {}", programMappings.size(), programId);

            // Step 2: Extract all unique subconcepts from the mappings
            Set<String> subconceptIds = programMappings.stream()
                .map(mapping -> mapping.getSubconcept().getSubconceptId())
                .collect(Collectors.toSet());
            logger.debug("Extracted {} unique subconcept IDs", subconceptIds.size());

            // Step 3: Retrieve all subconcepts by their IDs
            List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);
            logger.debug("Retrieved {} subconcepts from repository", subconcepts.size());

            // Step 4: Group subconcepts by their parent concepts
            Map<Concept, List<Subconcept>> conceptSubconceptMap = new HashMap<>();
            for (Subconcept subconcept : subconcepts) {
                Concept concept = subconcept.getConcept();
                conceptSubconceptMap.computeIfAbsent(concept, k -> new ArrayList<>()).add(subconcept);
            }

            logger.info("Successfully grouped subconcepts into {} concepts for program ID: {}", conceptSubconceptMap.size(), programId);
            return conceptSubconceptMap;

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for getConceptsAndSubconceptsByProgram: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while retrieving concepts and subconcepts for program ID: {}", programId, e);
            throw new RuntimeException("Failed to retrieve concepts and subconcepts", e);
        }
    }


    @Override
    @Cacheable(value = "conceptsByProgram", key = "#programId")
    public List<Concept> getAllConceptsInProgram(String programId) {
        try {
            logger.info("Retrieving all concepts for program ID: {}", programId);

            if (programId == null || programId.trim().isEmpty()) {
                logger.error("Program ID is null or empty");
                throw new IllegalArgumentException("Program ID cannot be null or empty");
            }
    
         // Step 1: Retrieve all ProgramConceptsMapping entries for the given programId
            List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);
            logger.debug("Found {} program mappings for program ID: {}", programMappings.size(), programId);

            // Step 2: Extract all unique subconcepts from the mappings
            Set<String> subconceptIds = programMappings.stream()
                .map(mapping -> mapping.getSubconcept().getSubconceptId())
                .collect(Collectors.toSet());
            logger.debug("Extracted {} unique subconcept IDs", subconceptIds.size());

            // Step 3: Retrieve all subconcepts by their IDs
            List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);
            logger.debug("Retrieved {} subconcepts from repository", subconcepts.size());

            // Step 4: Extract all unique concepts from the subconcepts
            Set<Concept> concepts = subconcepts.stream()
                .map(Subconcept::getConcept)
                .collect(Collectors.toSet());

            List<Concept> conceptList = new ArrayList<>(concepts);
            logger.info("Successfully retrieved {} unique concepts for program ID: {}", conceptList.size(), programId);
            return conceptList;

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for getAllConceptsInProgram: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error occurred while retrieving concepts for program ID: {}", programId, e);
            throw new RuntimeException("Failed to retrieve concepts for program", e);
        }
    }
    
    @Override
    @Cacheable(value = "conceptsAndProgress", key = "#programId + '_' + #userId")
    public Map<String, Object> getConceptsAndUserProgress(String programId, String userId) {
        try {
            logger.info("Retrieving concepts and user progress for program ID: {} and user ID: {}", programId, userId);

            if (programId == null || programId.trim().isEmpty()) {
                throw new IllegalArgumentException("Program ID cannot be null or empty");
            }
            if (userId == null || userId.trim().isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }

            // ✅ Step 1: Get userType from DB
            String userType = userRepository.findById(userId)
                    .map(User::getUserType)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
            logger.debug("User ID {} has userType: {}", userId, userType);

            // Step 2: Retrieve program mappings
            List<ProgramConceptsMapping> programMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);
            logger.debug("Found {} program mappings for program ID: {}", programMappings.size(), programId);

            // Step 3: Extract all unique subconcepts
            Set<String> subconceptIds = programMappings.stream()
                    .map(mapping -> mapping.getSubconcept().getSubconceptId())
                    .collect(Collectors.toSet());

            List<Subconcept> subconcepts = subconceptRepository.findAllById(subconceptIds);
            logger.debug("Retrieved {} subconcepts", subconcepts.size());

            // ✅ Step 4: Apply visibility filtering
            List<Subconcept> visibleSubconcepts = subconcepts.stream()
                    .filter(sub -> isSubconceptVisibleToUser(userType, sub))
                    .collect(Collectors.toList());
            logger.debug("After filtering, {} subconcepts are visible to userType {}", visibleSubconcepts.size(), userType);

            // Step 5: User's completed subconcepts
            Set<String> completedSubconceptIds = userSubConceptRepository.findCompletedSubconceptIdsByUser_UserId(userId);

            // Step 6: User's best scores
            List<Object[]> userScoresList = userAttemptsRepository.findMaxScoresByUser(userId);
            Map<String, Integer> userMaxScoreMap = new HashMap<>();
            for (Object[] row : userScoresList) {
                String subId = (String) row[0];
                Integer maxScore = ((Number) row[1]).intValue();
                userMaxScoreMap.put(subId, maxScore);
            }

            // Step 7: Group subconcepts by concept
            Map<Concept, List<Subconcept>> conceptSubconceptMap = new HashMap<>();
            for (Subconcept subconcept : visibleSubconcepts) {
                Concept concept = subconcept.getConcept();
                conceptSubconceptMap.computeIfAbsent(concept, k -> new ArrayList<>()).add(subconcept);
            }

            // Step 8: Build response
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> conceptList = new ArrayList<>();

            for (Map.Entry<Concept, List<Subconcept>> entry : conceptSubconceptMap.entrySet()) {
                Concept concept = entry.getKey();
                List<Subconcept> subconceptsInConcept = entry.getValue();

                int totalSubconcepts = subconceptsInConcept.size();
                int completedSubconcepts = (int) subconceptsInConcept.stream()
                        .filter(sub -> completedSubconceptIds.contains(sub.getSubconceptId()))
                        .count();

                int totalMaxScore = subconceptsInConcept.stream()
                        .map(sub -> sub.getSubconceptMaxscore() != null ? sub.getSubconceptMaxscore() : 0)
                        .reduce(0, Integer::sum);

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

        } catch (Exception e) {
            logger.error("Failed to retrieve concepts and user progress", e);
            throw new RuntimeException("Failed to retrieve concepts and user progress", e);
        }
    }

     //New Method for the whole program data
    @Override
    @Cacheable(value = "completeProgramStructure", key = "#userId + '_' + #programId")
    public ProgramDTO getCompleteProgramStructure(String userId, String programId) {
        try {
            logger.info("Fetching complete program structure with subconcepts for userId: {} and programId: {}", userId, programId);
            
            // STEP 1: Get base program structure with stages/units (reuses existing logic)
            ProgramDTO programDTO = unitService.getProgramWithStagesAndUnits(userId, programId);
            
            // STEP 2: Get user details for visibility filtering
            User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            String userType = user.getUserType();
            
            // STEP 3: Fetch ALL program mappings in ONE query (performance optimization)
            List<ProgramConceptsMapping> allMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);
            
            // STEP 4: Group mappings by unitId for O(1) lookup
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit = allMappings.stream()
                .collect(Collectors.groupingBy(
                    mapping -> mapping.getUnit().getUnitId(),
                    LinkedHashMap::new,
                    Collectors.toList()
                ));
            
            // STEP 5: Get ALL user completions in ONE query
            List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
            
            // STEP 6: Create completion lookup set for O(1) checks
            Set<String> completedSubconceptIds = userSubConcepts.stream()
                .map(us -> us.getSubconcept().getSubconceptId())
                .collect(Collectors.toSet());
            
            // STEP 7: Enrich each unit with its subconcepts
            programDTO.getStages().values().forEach(stageDTO -> {
                stageDTO.getUnits().values().forEach(unitDTO -> {
                    enrichUnitWithSubconcepts(
                        unitDTO, 
                        mappingsByUnit, 
                        userType, 
                        completedSubconceptIds
                    );
                });
            });
            
            logger.info("Successfully built complete program structure for userId: {} and programId: {}", 
                        userId, programId);
            return programDTO;
            
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error fetching complete program structure: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch complete program structure", e);
        }
    }

   //  Enriches a unit with its subconcepts maintaining existing completion logic
    private void enrichUnitWithSubconcepts(
            UnitResponseDTO unitDTO,
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit,
            String userType,
            Set<String> completedSubconceptIds) {
        
        try {
            List<ProgramConceptsMapping> unitMappings = mappingsByUnit.get(unitDTO.getUnitId());
            
            if (unitMappings == null || unitMappings.isEmpty()) {
                unitDTO.setSubconcepts(Collections.emptyMap());
                return;
            }
            
            // Filter by visibility and sort by position
            List<ProgramConceptsMapping> accessibleMappings = unitMappings.stream()
                .filter(mapping -> isSubconceptVisibleToUser(userType, mapping.getSubconcept()))
                .sorted(Comparator.comparing(ProgramConceptsMapping::getPosition))
                .collect(Collectors.toList());
            
            if (accessibleMappings.isEmpty()) {
                unitDTO.setSubconcepts(Collections.emptyMap());
                return;
            }
            
            // Build subconcepts map with completion logic
            Map<String, SubconceptResponseDTO> subconceptsMap = new LinkedHashMap<>();
            boolean enableNextSubconcept = true;
            int lastCompletedNormalIndex = -1;
            
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
            
            logger.debug("Unit {} - Last completed normal concept index: {}", 
                        unitDTO.getUnitId(), lastCompletedNormalIndex);
            
            // Second pass: build subconcepts with proper status
            for (int i = 0; i < accessibleMappings.size(); i++) {
                ProgramConceptsMapping mapping = accessibleMappings.get(i);
                Subconcept subconcept = mapping.getSubconcept();
                
                SubconceptResponseDTO subconceptDTO = new SubconceptResponseDTO();
                subconceptDTO.setSubconceptId(subconcept.getSubconceptId());
                subconceptDTO.setSubconceptDesc(subconcept.getSubconceptDesc());
                subconceptDTO.setSubconceptDesc2(subconcept.getSubconceptDesc2());
                subconceptDTO.setSubconceptType(subconcept.getSubconceptType());
                
                // Process link for signed URLs
                String originalLink = subconcept.getSubconceptLink();
                String processedLink = processSubconceptLink(originalLink);
                subconceptDTO.setSubconceptLink(processedLink);
                
                subconceptDTO.setDependency(subconcept.getDependency());
                subconceptDTO.setSubconceptMaxscore(subconcept.getSubconceptMaxscore());
                subconceptDTO.setNumQuestions(subconcept.getNumQuestions());
                subconceptDTO.setShowTo(subconcept.getShowTo());
                subconceptDTO.setSubconceptGroup(subconcept.getSubconceptGroup());
                subconceptDTO.setSubconceptDuration(subconcept.getSubconceptDuration());
                
                // Determine completion status (reusing existing logic)
                boolean isCompleted = completedSubconceptIds.contains(subconcept.getSubconceptId());
                boolean isAssignment = subconcept.getSubconceptType().toLowerCase().startsWith("assignment");
                
                if (isCompleted) {
                    subconceptDTO.setCompletionStatus("yes");
                    if (!isAssignment) {
                        enableNextSubconcept = true;
                    }
                } else {
                    if (isAssignment) {
                        // Assignment logic
                        boolean prevConceptsCompleted = true;
                        int prevAssignmentIndex = -1;
                        
                        // Find previous assignment
                        for (int j = i - 1; j >= 0; j--) {
                            if (accessibleMappings.get(j).getSubconcept().getSubconceptType()
                                    .toLowerCase().startsWith("assignment")) {
                                prevAssignmentIndex = j;
                                break;
                            }
                        }
                        
                        // Check completion between assignments
                        for (int j = prevAssignmentIndex + 1; j < i; j++) {
                            Subconcept prev = accessibleMappings.get(j).getSubconcept();
                            if (!prev.getSubconceptType().toLowerCase().startsWith("assignment") &&
                                !completedSubconceptIds.contains(prev.getSubconceptId())) {
                                prevConceptsCompleted = false;
                                break;
                            }
                        }
                        
                        subconceptDTO.setCompletionStatus(prevConceptsCompleted ? "ignored" : "disabled");
                        
                    } else if (enableNextSubconcept) {
                        subconceptDTO.setCompletionStatus("incomplete");
                        enableNextSubconcept = false;
                    } else {
                        subconceptDTO.setCompletionStatus("disabled");
                    }
                }
                
                subconceptsMap.put(String.valueOf(i), subconceptDTO);
            }
            
            unitDTO.setSubconcepts(subconceptsMap);
            logger.debug("Enriched unit {} with {} subconcepts", unitDTO.getUnitId(), subconceptsMap.size());
            
        } catch (Exception e) {
            logger.error("Error enriching unit {} with subconcepts: {}", unitDTO.getUnitId(), e.getMessage(), e);
            unitDTO.setSubconcepts(Collections.emptyMap());
        }
    }
    
    
    @Override
    @Cacheable(value = "completeArrayProgramStructure", key = "#userId + '_' + #programId")
    public CompleteProgramDTO getCompleteArrayProgramStructure(String userId, String programId) {
        try {
            logger.info("Fetching complete program structure with array-based JSON for userId: {} and programId: {}", 
                        userId, programId);
            
            // STEP 1: Get base program structure (Map-based from existing API)
            ProgramDTO programDTO = unitService.getProgramWithStagesAndUnits(userId, programId);
            
            // STEP 2: Get user details for visibility filtering
            User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            String userType = user.getUserType();
            
            // STEP 3: Fetch ALL program mappings in ONE query
            List<ProgramConceptsMapping> allMappings = programConceptsMappingRepository.findByProgram_ProgramId(programId);
            
            // STEP 4: Group mappings by unitId for O(1) lookup
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit = allMappings.stream().collect(Collectors.groupingBy(
                    mapping -> mapping.getUnit().getUnitId(),
                    LinkedHashMap::new,
                    Collectors.toList()
                ));
            
//            Map<String, List<ProgramConceptsMapping>> mappingsByUnit = allMappings.stream()
//            	        //  USER-SPECIFIC FILTER
//            		.filter(mapping -> {
//            		    if (isDemoUser(userId)) {
//            		        return DEMO_USER_ALLOWED_UNITS.contains(
//            		            mapping.getUnit().getUnitId()
//            		        );
//            		    }
//            		    return true;
//            		})
//            	        .collect(Collectors.groupingBy(
//            	            mapping -> mapping.getUnit().getUnitId(),
//            	            LinkedHashMap::new,
//            	            Collectors.toList()
//            	        ));
            
            // STEP 5: Get ALL user completions in ONE query
            List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
            
            // STEP 6: Create completion lookup set for O(1) checks
            Set<String> completedSubconceptIds = userSubConcepts.stream().map(us -> us.getSubconcept().getSubconceptId())
                .collect(Collectors.toSet());
            
            // STEP 7: Convert Map-based DTO to Array-based DTO
            CompleteProgramDTO completeProgramDTO = convertToArrayBasedDTO(
                programDTO, mappingsByUnit, userType, completedSubconceptIds);
            
            logger.info("Successfully built complete program structure for userId: {} and programId: {}", 
                        userId, programId);
            return completeProgramDTO;
            
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error fetching complete program structure: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch complete program structure", e);
        }
    }

 
 //    Converts Map-based ProgramDTO to Array-based CompleteProgramDTO
    private CompleteProgramDTO convertToArrayBasedDTO(
            ProgramDTO programDTO,
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit,
            String userType,
            Set<String> completedSubconceptIds) {
        
        CompleteProgramDTO completeDTO = new CompleteProgramDTO();
        completeDTO.setProgramId(programDTO.getProgramId());
        completeDTO.setProgramName(programDTO.getProgramName());
        completeDTO.setProgramDesc(programDTO.getProgramDesc());
        completeDTO.setStagesCount(programDTO.getStagesCount());
        completeDTO.setUnitCount(programDTO.getUnitCount());
        completeDTO.setProgramCompletionStatus(programDTO.getProgramCompletionStatus());
        
        // Convert Map<String, StageDTO> to List<CompleteStageDTO>
        List<CompleteStageDTO> stages = programDTO.getStages().entrySet().stream()
            .sorted(Map.Entry.comparingByKey()) // Sort by numeric key
            .map(entry -> convertToCompleteStageDTO(
                entry.getValue(), 
                mappingsByUnit, 
                userType, 
                completedSubconceptIds
            ))
            .collect(Collectors.toList());
        
        completeDTO.setStages(stages);
        return completeDTO;
    }

     // Converts StageDTO to CompleteStageDTO with array-based units
    private CompleteStageDTO convertToCompleteStageDTO(
            StageDTO stageDTO,
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit,
            String userType,
            Set<String> completedSubconceptIds) {
        
        CompleteStageDTO completeStageDTO = new CompleteStageDTO();
        completeStageDTO.setStageId(stageDTO.getStageId());
        completeStageDTO.setStageName(stageDTO.getStageName());
        completeStageDTO.setStageDesc(stageDTO.getStageDesc());
        completeStageDTO.setStageCompletionStatus(stageDTO.getStageCompletionStatus());
        completeStageDTO.setStageEnabled(stageDTO.isStageEnabled());
        completeStageDTO.setDaysUntilNextStageEnabled(stageDTO.getDaysUntilNextStageEnabled());
        completeStageDTO.setStageAvailableDate(stageDTO.getStageAvailableDate());
        
        // Convert Map<String, UnitResponseDTO> to List<CompleteUnitDTO>
        List<CompleteUnitDTO> units = stageDTO.getUnits().entrySet().stream()
        	    .sorted(Map.Entry.comparingByKey())
        	    .map(entry -> convertToCompleteUnitDTO(
        	        entry.getValue(), mappingsByUnit, userType, completedSubconceptIds
        	    ))
        	    .collect(Collectors.toList());
//        List<CompleteUnitDTO> units = stageDTO.getUnits().entrySet().stream()
//        	    .sorted(Map.Entry.comparingByKey())
//        	    .map(entry -> convertToCompleteUnitDTO(
//        	        entry.getValue(), mappingsByUnit, userType, completedSubconceptIds
//        	    ))
//        	    // 🔥 Remove units with no subconcepts (demo user case)
//        	    .filter(unit -> unit.getSubconcepts() != null && !unit.getSubconcepts().isEmpty())
//        	    .collect(Collectors.toList());

        completeStageDTO.setUnits(units);
        return completeStageDTO;
    }

     // Converts UnitResponseDTO to CompleteUnitDTO with subconcepts
    private CompleteUnitDTO convertToCompleteUnitDTO(
            UnitResponseDTO unitDTO,
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit,
            String userType,
            Set<String> completedSubconceptIds) {
        
        CompleteUnitDTO completeUnitDTO = new CompleteUnitDTO();
        completeUnitDTO.setUnitId(unitDTO.getUnitId());
        completeUnitDTO.setUnitName(unitDTO.getUnitName());
        completeUnitDTO.setUnitDesc(unitDTO.getUnitDesc());
        completeUnitDTO.setCompletionStatus(unitDTO.getCompletionStatus());
        
        // Enrich with subconcepts
        List<SubconceptResponseDTO> subconcepts = buildSubconceptsList(
            unitDTO.getUnitId(),
            mappingsByUnit,
            userType,
            completedSubconceptIds
        );
        
        completeUnitDTO.setSubconcepts(subconcepts);
        return completeUnitDTO;
    }

 
 //  Builds subconcepts list with proper completion logic
    private List<SubconceptResponseDTO> buildSubconceptsList(
            String unitId,
            Map<String, List<ProgramConceptsMapping>> mappingsByUnit,
            String userType,
            Set<String> completedSubconceptIds) {
        
        try {
            List<ProgramConceptsMapping> unitMappings = mappingsByUnit.get(unitId);
            
            if (unitMappings == null || unitMappings.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Filter by visibility and sort by position
            List<ProgramConceptsMapping> accessibleMappings = unitMappings.stream()
                .filter(mapping -> isSubconceptVisibleToUser(userType, mapping.getSubconcept()))
                .sorted(Comparator.comparing(ProgramConceptsMapping::getPosition))
                .collect(Collectors.toList());
            
            if (accessibleMappings.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Build subconcepts list with completion logic
            List<SubconceptResponseDTO> subconceptsList = new ArrayList<>();
            boolean enableNextSubconcept = true;
            int lastCompletedNormalIndex = -1;
            
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
            
            logger.debug("Unit {} - Last completed normal concept index: {}", unitId, lastCompletedNormalIndex);
            
            // Second pass: build subconcepts with proper status
            for (int i = 0; i < accessibleMappings.size(); i++) {
                ProgramConceptsMapping mapping = accessibleMappings.get(i);
                Subconcept subconcept = mapping.getSubconcept();
                
                SubconceptResponseDTO subconceptDTO = new SubconceptResponseDTO();
                subconceptDTO.setSubconceptId(subconcept.getSubconceptId());
                subconceptDTO.setSubconceptDesc(subconcept.getSubconceptDesc());
                subconceptDTO.setSubconceptDesc2(subconcept.getSubconceptDesc2());
                subconceptDTO.setSubconceptType(subconcept.getSubconceptType());
                
                // Process link for signed URLs
                String originalLink = subconcept.getSubconceptLink();
                String processedLink = processSubconceptLink(originalLink);
                subconceptDTO.setSubconceptLink(processedLink);
                
                subconceptDTO.setDependency(subconcept.getDependency());
                subconceptDTO.setSubconceptMaxscore(subconcept.getSubconceptMaxscore());
                subconceptDTO.setNumQuestions(subconcept.getNumQuestions());
                subconceptDTO.setShowTo(subconcept.getShowTo());
                subconceptDTO.setSubconceptGroup(subconcept.getSubconceptGroup());
                subconceptDTO.setSubconceptDuration(subconcept.getSubconceptDuration());
                
                // Determine completion status (reusing existing logic)
                boolean isCompleted = completedSubconceptIds.contains(subconcept.getSubconceptId());
                boolean isAssignment = subconcept.getSubconceptType().toLowerCase().startsWith("assignment");
                
                if (isCompleted) {
                    subconceptDTO.setCompletionStatus("yes");
                    if (!isAssignment) {
                        enableNextSubconcept = true;
                    }
                } else {
                    if (isAssignment) {
                        // Assignment logic
                        boolean prevConceptsCompleted = true;
                        int prevAssignmentIndex = -1;
                        
                        // Find previous assignment
                        for (int j = i - 1; j >= 0; j--) {
                            if (accessibleMappings.get(j).getSubconcept().getSubconceptType()
                                    .toLowerCase().startsWith("assignment")) {
                                prevAssignmentIndex = j;
                                break;
                            }
                        }
                        
                        // Check completion between assignments
                        for (int j = prevAssignmentIndex + 1; j < i; j++) {
                            Subconcept prev = accessibleMappings.get(j).getSubconcept();
                            if (!prev.getSubconceptType().toLowerCase().startsWith("assignment") &&
                                !completedSubconceptIds.contains(prev.getSubconceptId())) {
                                prevConceptsCompleted = false;
                                break;
                            }
                        }
                        
                        subconceptDTO.setCompletionStatus(prevConceptsCompleted ? "ignored" : "disabled");
                        
                    } else if (enableNextSubconcept) {
                        subconceptDTO.setCompletionStatus("incomplete");
                        enableNextSubconcept = false;
                    } else {
                        subconceptDTO.setCompletionStatus("disabled");
                    }
                }
                
                subconceptsList.add(subconceptDTO);
            }
            
            logger.debug("Built {} subconcepts for unit {}", subconceptsList.size(), unitId);
            return subconceptsList;
            
        } catch (Exception e) {
            logger.error("Error building subconcepts list for unit {}: {}", unitId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}