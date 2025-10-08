package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
// import com.FlowofEnglish.util.DurationCalculator;
import com.opencsv.CSVReader;

import jakarta.transaction.Transactional;

import org.springframework.cache.annotation.*;
import org.slf4j.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubconceptServiceImpl implements SubconceptService {

    @Autowired
    private SubconceptRepository subconceptRepository;
    
//    @Autowired
//    private DurationCalculator durationCalculator;
    
    @Autowired
    private ConceptRepository conceptRepository; 
    
    @Autowired
    private ContentMasterRepository contentRepository; 

    private static final Logger logger = LoggerFactory.getLogger(SubconceptServiceImpl.class);
   
    @Override
    @Cacheable(value = "subconcepts", key = "'all_subconcepts'")
    public List<Subconcept> getAllSubconcept() {
        logger.info("Fetching all subconcepts from database");
        try {
            List<Subconcept> subconcepts = subconceptRepository.findAll();
            logger.info("Retrieved {} subconcepts", subconcepts.size());
            return subconcepts;
        } catch (Exception e) {
            logger.error("Error fetching all subconcepts", e);
            throw new RuntimeException("Failed to fetch subconcepts: " + e.getMessage());
        }
    }
    
    @Override
    @Cacheable(value = "subconceptDTOs", key = "'all_subconcept_dtos'")
    public List<SubconceptResponseDTO> getAllSubconcepts() {
        logger.info("Fetching all subconcepts as DTOs");
        try {
            List<SubconceptResponseDTO> dtos = subconceptRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            logger.info("Retrieved {} subconcept DTOs", dtos.size());
            return dtos;
        } catch (Exception e) {
            logger.error("Error fetching all subconcept DTOs", e);
            throw new RuntimeException("Failed to fetch subconcept DTOs: " + e.getMessage());
        }
    }

    
    @Override
    @Cacheable(value = "subconcepts", key = "#subconceptId")
    public Optional<Subconcept> findBySubconceptId(String subconceptId) {
        logger.info("Finding subconcept by ID: {}", subconceptId);
        
        if (subconceptId == null || subconceptId.trim().isEmpty()) {
            logger.error("Subconcept ID is null or empty");
            throw new IllegalArgumentException("Subconcept ID cannot be null or empty");
        }
        
        try {
            Optional<Subconcept> subconcept = subconceptRepository.findBySubconceptId(subconceptId);
            if (subconcept.isPresent()) {
                logger.info("Subconcept found with ID: {}", subconceptId);
            } else {
                logger.warn("Subconcept not found with ID: {}", subconceptId);
            }
            return subconcept;
        } catch (Exception e) {
            logger.error("Error finding subconcept by ID: {}", subconceptId, e);
            throw new RuntimeException("Failed to find subconcept: " + e.getMessage());
        }
    }
    
    @Override
    @Cacheable(value = "subconceptDTOs", key = "#subconceptId")
    public Optional<SubconceptResponseDTO> getSubconceptById(String subconceptId) {
        logger.info("Getting subconcept DTO by ID: {}", subconceptId);
        
        if (subconceptId == null || subconceptId.trim().isEmpty()) {
            logger.error("Subconcept ID is null or empty");
            throw new IllegalArgumentException("Subconcept ID cannot be null or empty");
        }
        
        try {
            Optional<SubconceptResponseDTO> dto = subconceptRepository.findById(subconceptId)
                .map(this::convertToDTO);
            if (dto.isPresent()) {
                logger.info("Subconcept DTO found with ID: {}", subconceptId);
            } else {
                logger.warn("Subconcept DTO not found with ID: {}", subconceptId);
            }
            return dto;
        } catch (Exception e) {
            logger.error("Error getting subconcept DTO by ID: {}", subconceptId, e);
            throw new RuntimeException("Failed to get subconcept DTO: " + e.getMessage());
        }
    }

    @Override
    @CacheEvict(value = {"subconcepts", "subconceptDTOs"}, allEntries = true)
    public Subconcept createSubconcept(Subconcept subconcept) {
        logger.info("Creating new subconcept with ID: {}", subconcept.getSubconceptId());
        
        try {
            Subconcept savedSubconcept = subconceptRepository.save(subconcept);
            logger.info("Successfully created subconcept with ID: {}", savedSubconcept.getSubconceptId());
            return savedSubconcept;
        } catch (Exception e) {
            logger.error("Error creating subconcept with ID: {}", subconcept.getSubconceptId(), e);
            throw new RuntimeException("Failed to create subconcept: " + e.getMessage());
        }
    }
    
    
    @Override
    @CacheEvict(value = {"subconcepts", "subconceptDTOs"}, allEntries = true)
    public Map<String, Object> uploadSubconceptsCSV(MultipartFile file) {
        logger.info("Starting CSV upload process for file: {}", file.getOriginalFilename());
        
        Map<String, Object> result = new HashMap<>();
        int createdCount = 0;
        int failedCount = 0;
        List<String> failedIds = new ArrayList<>();
        int lineNumber = 0;
        
        if (file.isEmpty()) {
            logger.error("Uploaded file is empty");
            throw new RuntimeException("File is empty");
        }
        
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();
            logger.info("Read {} lines from CSV file", records.size());
            
            if (records.isEmpty()) {
                logger.error("CSV file contains no data");
                throw new RuntimeException("CSV file is empty");
            }
            for (int i = 1; i < records.size(); i++) { // Skip header row
            	lineNumber = i + 1;
                String[] record = records.get(i);
                
                try {
                    if (record.length < 12) {
                        String error = String.format("Line %d: Invalid CSV format - expected 12 columns, found %d", 
                                                    lineNumber, record.length);
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }
                    
                    String subconceptId = record[0].trim();
                    
                    if (subconceptId.isEmpty()) {
                        String error = String.format("Line %d: Subconcept ID cannot be empty", lineNumber);
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }

                    if (subconceptRepository.existsById(subconceptId)) {
                        String error = "Line " + lineNumber + ": SubconceptId " + subconceptId + " already exists";
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }

                    Subconcept subconcept = new Subconcept();
                    subconcept.setSubconceptId(subconceptId);
                    subconcept.setDependency(record[1].trim());
                    subconcept.setShowTo(record[2].trim());
                    subconcept.setSubconceptDesc(record[3].trim());
                    subconcept.setSubconceptDesc2(record[4].trim());
                    subconcept.setSubconceptGroup(record[5].trim());
                    subconcept.setSubconceptLink(record[6].trim());
                    subconcept.setSubconceptType(record[7].trim());
                    
                    // Parse numeric fields with validation
                    try {
                        int numQuestions = Integer.parseInt(record[8].trim());
                        int maxScore = Integer.parseInt(record[9].trim());
                        
                        if (numQuestions < 0 || maxScore < 0) {
                            String error = String.format("Line %d: NumQuestions and MaxScore must be non-negative", lineNumber);
                            logger.warn(error);
                            failedIds.add(error);
                            failedCount++;
                            continue;
                        }
                        
                        subconcept.setNumQuestions(numQuestions);
                        subconcept.setSubconceptMaxscore(maxScore);
                    } catch (NumberFormatException e) {
                        String error = String.format("Line %d: Invalid number format for NumQuestions or MaxScore", lineNumber);
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }
                    
                    subconcept.setUuid(UUID.randomUUID().toString());

                    // Fetch and set Concept and ContentMaster
                    String conceptId = record[10].trim();
                    String contentId = record[11].trim();
                    
                    Optional<Concept> concept = conceptRepository.findById(conceptId);
                    if (concept.isEmpty()) {
                        String error = String.format("Line %d: ConceptId %s not found for SubconceptId %s", 
                                                    lineNumber, conceptId, subconceptId);
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }

                    try {
                        int contentIdInt = Integer.parseInt(contentId);
                        Optional<ContentMaster> content = contentRepository.findById(contentIdInt);
                        if (content.isEmpty()) {
                            String error = String.format("Line %d: ContentId %s not found for SubconceptId %s", 
                                                        lineNumber, contentId, subconceptId);
                            logger.warn(error);
                            failedIds.add(error);
                            failedCount++;
                            continue;
                        }
                        subconcept.setConcept(concept.get());
                        subconcept.setContent(content.get());
                    } catch (NumberFormatException e) {
                        String error = String.format("Line %d: Invalid ContentId format: %s", lineNumber, contentId);
                        logger.warn(error);
                        failedIds.add(error);
                        failedCount++;
                        continue;
                    }

                    subconceptRepository.save(subconcept);
                    createdCount++;
                    logger.debug("Successfully created subconcept: {}", subconceptId);
                    
                } catch (Exception e) {
                    String error = String.format("Line %d: Unexpected error - %s", lineNumber, e.getMessage());
                    logger.error(error, e);
                    failedIds.add(error);
                    failedCount++;
                }
            }
            
        } catch (Exception e) {
            logger.error("Error processing CSV file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to process CSV file: " + e.getMessage());
        }

        result.put("createdCount", createdCount);
        result.put("failedCount", failedCount);
        result.put("totalProcessed", createdCount + failedCount);
        result.put("failedIds", failedIds);
        
        logger.info("CSV upload completed. Created: {}, Failed: {}, Total processed: {}", 
                   createdCount, failedCount, createdCount + failedCount);
        return result;
    }
    
    @Override
    @CachePut(value = "subconcepts", key = "#subconceptId")
    @CacheEvict(value = "subconceptDTOs", allEntries = true)
    public Subconcept updateSubconcept(String subconceptId, Subconcept subconcept) {
    logger.info("Updating subconcept with ID: {}", subconceptId);
        
        if (subconceptId == null || subconceptId.trim().isEmpty()) {
            logger.error("Subconcept ID is null or empty");
            throw new IllegalArgumentException("Subconcept ID cannot be null or empty");
        }
        
        if (subconcept == null) {
            logger.error("Subconcept object is null");
            throw new IllegalArgumentException("Subconcept cannot be null");
        }
        
        return subconceptRepository.findById(subconceptId).map(existingSubconcept -> {
            logger.debug("Found existing subconcept, updating fields");
            existingSubconcept.setDependency(subconcept.getDependency());
            existingSubconcept.setShowTo(subconcept.getShowTo());
            existingSubconcept.setSubconceptDesc(subconcept.getSubconceptDesc());
            existingSubconcept.setSubconceptGroup(subconcept.getSubconceptGroup());
            existingSubconcept.setSubconceptLink(subconcept.getSubconceptLink());
            existingSubconcept.setSubconceptDesc2(subconcept.getSubconceptDesc2());
            existingSubconcept.setSubconceptType(subconcept.getSubconceptType());
            existingSubconcept.setNumQuestions(subconcept.getNumQuestions());
            existingSubconcept.setSubconceptMaxscore(subconcept.getSubconceptMaxscore());
            existingSubconcept.setConcept(subconcept.getConcept());
            existingSubconcept.setContent(subconcept.getContent());
            try {
                Subconcept updatedSubconcept = subconceptRepository.save(existingSubconcept);
                logger.info("Successfully updated subconcept with ID: {}", subconceptId);
                return updatedSubconcept;
            } catch (Exception e) {
                logger.error("Error saving updated subconcept with ID: {}", subconceptId, e);
                throw new RuntimeException("Failed to save updated subconcept: " + e.getMessage());
            }
        }).orElseThrow(() -> {
            logger.error("Subconcept not found for update with ID: {}", subconceptId);
            return new RuntimeException("Subconcept not found with ID: " + subconceptId);
        });
    }

 

    @Override
    @CacheEvict(value = {"subconcepts", "subconceptDTOs"}, allEntries = true)
    public Map<String, Object> updateSubconceptsCSV(MultipartFile file) {
        logger.info("Starting CSV update process for file: {}", file.getOriginalFilename());
        
        Map<String, Object> result = new HashMap<>();
        int updatedCount = 0;
        int failedCount = 0;
        int notFoundCount = 0;
        List<String> failedIds = new ArrayList<>();
        List<String> notFoundIds = new ArrayList<>();
        List<String> updateLogs = new ArrayList<>();

        if (file.isEmpty()) {
            logger.error("Uploaded file is empty");
            throw new RuntimeException("File is empty");
        }

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();
            
            // Validate header row exists
            if (records.isEmpty()) {
                logger.error("CSV file is empty");
                throw new RuntimeException("CSV file is empty");
            }
            
            logger.info("Processing {} records from CSV file", records.size() - 1);
            
            // Read and validate header row
            String[] headers = records.get(0);
            Map<String, Integer> headerMap = new HashMap<>();
            
            // Create header mapping
            for (int i = 0; i < headers.length; i++) {
                headerMap.put(headers[i].trim().toLowerCase(), i);
            }
            
            // Validate required subconceptId column exists
            if (!headerMap.containsKey("subconceptid")) {
                logger.error("CSV must contain 'subconceptId' column");
                throw new RuntimeException("CSV must contain 'subconceptId' column");
            }
            
            int subconceptIdIndex = headerMap.get("subconceptid");
            logger.debug("Found subconceptId column at index: {}", subconceptIdIndex);
            
            // Process data rows
            for (int i = 1; i < records.size(); i++) {
                String[] record = records.get(i);
                int lineNumber = i + 1;
                
                try {
                    // Skip rows with insufficient data
                    if (record.length <= subconceptIdIndex) {
                        String error = "Line " + lineNumber + ": Missing subconceptId column";
                        logger.warn(error);
                        failedCount++;
                        failedIds.add(error);
                        continue;
                    }
                    
                    String subconceptId = record[subconceptIdIndex].trim();
                    
                    // Skip empty subconcept IDs
                    if (subconceptId.isEmpty()) {
                        String error = "Line " + lineNumber + ": Empty SubconceptId";
                        logger.warn(error);
                        failedCount++;
                        failedIds.add(error);
                        continue;
                    }

                    // Check if subconcept exists
                    Optional<Subconcept> existingSubconceptOpt = subconceptRepository.findById(subconceptId);
                    if (existingSubconceptOpt.isEmpty()) {
                        String error = "SubconceptId: " + subconceptId + " not found";
                        logger.warn(error);
                        notFoundCount++;
                        notFoundIds.add(error);
                        continue;
                    }

                    Subconcept existingSubconcept = existingSubconceptOpt.get();
                    List<String> updatedFields = new ArrayList<>();
                    boolean hasUpdates = false;
                    
                    // Update fields dynamically based on header mapping
                    hasUpdates |= updateField(headerMap, record, "dependency", 
                        existingSubconcept::setDependency, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "showto", 
                        existingSubconcept::setShowTo, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "subconceptdesc", 
                        existingSubconcept::setSubconceptDesc, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "subconceptdesc2", 
                        existingSubconcept::setSubconceptDesc2, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "subconceptgroup", 
                        existingSubconcept::setSubconceptGroup, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "subconceptlink", 
                        existingSubconcept::setSubconceptLink, updatedFields);
                    hasUpdates |= updateField(headerMap, record, "subconcepttype", 
                        existingSubconcept::setSubconceptType, updatedFields);
                    
                    // Update numeric fields with validation
                    if (updateNumericField(headerMap, record, "numquestions", 
                        existingSubconcept::setNumQuestions, updatedFields, subconceptId, failedIds)) {
                        hasUpdates = true;
                    }
                    
                    if (updateNumericField(headerMap, record, "subconceptmaxscore", 
                        existingSubconcept::setSubconceptMaxscore, updatedFields, subconceptId, failedIds)) {
                        hasUpdates = true;
                    }
                    
                 // Update Concept (if conceptId column is present and valid)
                    if (headerMap.containsKey("conceptid") && record.length > headerMap.get("conceptid")) {
                        String conceptId = record[headerMap.get("conceptid")].trim();
                        if (!conceptId.isEmpty()) {
                            Optional<Concept> conceptOpt = conceptRepository.findById(conceptId);
                            if (conceptOpt.isPresent()) {
                                existingSubconcept.setConcept(conceptOpt.get());
                                updatedFields.add("conceptId");
                                hasUpdates = true;
                            } else {
                                String error = "SubconceptId: " + subconceptId + " failed - ConceptId " + conceptId + " not found";
                                failedIds.add(error);
                                logger.warn(error);
                            }
                        }
                    }

                    // Update Content (if contentId column is present and valid)
                    if (headerMap.containsKey("contentid") && record.length > headerMap.get("contentid")) {
                        String contentIdStr = record[headerMap.get("contentid")].trim();
                        if (!contentIdStr.isEmpty()) {
                            try {
                                int contentId = Integer.parseInt(contentIdStr);
                                Optional<ContentMaster> contentOpt = contentRepository.findById(contentId);
                                if (contentOpt.isPresent()) {
                                    existingSubconcept.setContent(contentOpt.get());
                                    updatedFields.add("contentId");
                                    hasUpdates = true;
                                } else {
                                    String error = "SubconceptId: " + subconceptId + " failed - ContentId " + contentId + " not found";
                                    failedIds.add(error);
                                    logger.warn(error);
                                }
                            } catch (NumberFormatException e) {
                                String error = "SubconceptId: " + subconceptId + " failed - Invalid ContentId format: " + contentIdStr;
                                failedIds.add(error);
                                logger.warn(error);
                            }
                        }
                    }

                    
                    // Save only if there are updates
                    if (hasUpdates) {
                        subconceptRepository.save(existingSubconcept);
                        updatedCount++;
                        String logMessage = "SubconceptId: " + subconceptId + " updated fields: " + String.join(", ", updatedFields);
                        updateLogs.add(logMessage);
                        logger.debug(logMessage);
                    } else {
                        String logMessage = "SubconceptId: " + subconceptId + " - No fields to update (all provided fields were empty)";
                        updateLogs.add(logMessage);
                        logger.debug(logMessage);
                    }
                    
                } catch (Exception e) {
                    String error = "Line " + lineNumber + ": Unexpected error - " + e.getMessage();
                    logger.error(error, e);
                    failedCount++;
                    failedIds.add(error);
                }
            }
            
        } catch (Exception e) {
            logger.error("Failed to process CSV file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to process CSV file: " + e.getMessage());
        }

        // Prepare result summary
        result.put("updatedCount", updatedCount);
        result.put("failedCount", failedCount);
        result.put("notFoundCount", notFoundCount);
        result.put("totalProcessed", updatedCount + failedCount + notFoundCount);
        result.put("failedIds", failedIds);
        result.put("notFoundIds", notFoundIds);
        result.put("updateLogs", updateLogs);
        result.put("message", "Update completed. Only non-empty fields were updated, existing data preserved for empty fields.");
        
        logger.info("CSV update completed. Updated: {}, Failed: {}, Not Found: {}, Total processed: {}", 
                   updatedCount, failedCount, notFoundCount, updatedCount + failedCount + notFoundCount);
        return result;
    }
    
    // Helper method to update string fields
    private boolean updateField(Map<String, Integer> headerMap, String[] record, String fieldName, 
                               java.util.function.Consumer<String> setter, List<String> updatedFields) {
        if (headerMap.containsKey(fieldName) && 
            record.length > headerMap.get(fieldName) && 
            !record[headerMap.get(fieldName)].trim().isEmpty()) {
            setter.accept(record[headerMap.get(fieldName)].trim());
            updatedFields.add(fieldName);
            return true;
        }
        return false;
    }
    
    // Helper method to update numeric fields
    private boolean updateNumericField(Map<String, Integer> headerMap, String[] record, String fieldName,
                                     java.util.function.Consumer<Integer> setter, List<String> updatedFields,
                                     String subconceptId, List<String> failedIds) {
        if (headerMap.containsKey(fieldName) && 
            record.length > headerMap.get(fieldName) && 
            !record[headerMap.get(fieldName)].trim().isEmpty()) {
            try {
                int value = Integer.parseInt(record[headerMap.get(fieldName)].trim());
                if (value < 0) {
                    failedIds.add("SubconceptId: " + subconceptId + " failed - " + fieldName + " cannot be negative");
                    return false;
                }
                setter.accept(value);
                updatedFields.add(fieldName);
                return true;
            } catch (NumberFormatException e) {
                failedIds.add("SubconceptId: " + subconceptId + " failed - Invalid number format for " + fieldName);
                return false;
            }
        }
        return false;
    }
    
    @Override
    @CacheEvict(value = {"subconcepts", "subconceptDTOs"}, allEntries = true)
    public void deleteSubconcept(String subconceptId) {
        logger.info("Deleting subconcept with ID: {}", subconceptId);
        
        if (subconceptId == null || subconceptId.trim().isEmpty()) {
            logger.error("Subconcept ID is null or empty");
            throw new IllegalArgumentException("Subconcept ID cannot be null or empty");
        }
        
        if (!subconceptRepository.existsById(subconceptId)) {
            logger.error("Attempted to delete non-existent subconcept with ID: {}", subconceptId);
            throw new RuntimeException("Subconcept not found with ID: " + subconceptId);
        }
        
        try {
            subconceptRepository.deleteById(subconceptId);
            logger.info("Successfully deleted subconcept with ID: {}", subconceptId);
        } catch (Exception e) {
            logger.error("Error deleting subconcept with ID: {}", subconceptId, e);
            throw new RuntimeException("Failed to delete subconcept: " + e.getMessage());
        }
    }
    
    // Convert Sub concept entity to SubconceptResponseDTO
    private SubconceptResponseDTO convertToDTO(Subconcept subconcept) {
        try {
            SubconceptResponseDTO dto = new SubconceptResponseDTO();
            dto.setSubconceptId(subconcept.getSubconceptId());
            dto.setDependency(subconcept.getDependency());
            dto.setSubconceptMaxscore(subconcept.getSubconceptMaxscore());
            dto.setSubconceptDesc(subconcept.getSubconceptDesc());
            dto.setSubconceptGroup(subconcept.getSubconceptGroup());
            dto.setSubconceptType(subconcept.getSubconceptType());
            dto.setSubconceptLink(subconcept.getSubconceptLink());
            return dto;
        } catch (Exception e) {
            logger.error("Error converting subconcept to DTO: {}", subconcept.getSubconceptId(), e);
            throw new RuntimeException("Failed to convert subconcept to DTO: " + e.getMessage());
        }
    }
    
//    @Transactional
//    public void populateDurations() {
//        List<Subconcept> subconcepts = subconceptRepository.findAll();
//        int updated = 0;
//
//        for (Subconcept s : subconcepts) {
//            if (s.getDuration() == null || s.getDuration() == 0) {
//                int duration = durationCalculator.calculateDuration(s);
//                s.setDuration(duration);
//                subconceptRepository.save(s);
//                updated++;
//                logger.info("Updated subconcept {} with duration {} seconds", s.getSubconceptId(), duration);
//            }
//        }
//
//        logger.info("Migration complete. Updated {} subconcepts", updated);
//    }

}
