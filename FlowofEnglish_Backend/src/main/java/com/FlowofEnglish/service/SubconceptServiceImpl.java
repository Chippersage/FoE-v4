package com.FlowofEnglish.service;



import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.Concept;
import com.FlowofEnglish.model.ContentMaster;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.repository.ConceptRepository;
import com.FlowofEnglish.repository.ContentMasterRepository;
import com.FlowofEnglish.repository.SubconceptRepository;
import com.opencsv.CSVReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubconceptServiceImpl implements SubconceptService {

    @Autowired
    private SubconceptRepository subconceptRepository;
    
    @Autowired
    private ConceptRepository conceptRepository; 
    
    @Autowired
    private ContentMasterRepository contentRepository; 

   
    @Override
    public List<Subconcept> getAllSubconcept() {
        return subconceptRepository.findAll();
    }
    @Override
    public List<SubconceptResponseDTO> getAllSubconcepts() {
        return subconceptRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    
    @Override
    public Optional<Subconcept> findBySubconceptId(String subconceptId) {
        return subconceptRepository.findBySubconceptId(subconceptId);
    }
    
    @Override
    public Optional<SubconceptResponseDTO> getSubconceptById(String subconceptId) {
        return subconceptRepository.findById(subconceptId).map(this::convertToDTO);
    }

    @Override
    public Subconcept createSubconcept(Subconcept subconcept) {
        return subconceptRepository.save(subconcept);
    }

    @Override
    public Map<String, Object> uploadSubconceptsCSV(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        int createdCount = 0;
        int failedCount = 0;
        List<String> failedIds = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();
            for (int i = 1; i < records.size(); i++) { // Skip header row
                String[] record = records.get(i);
                String subconceptId = record[0]; // Assuming `subconceptId` is the first column

                if (subconceptRepository.existsById(subconceptId)) {
                    failedCount++;
                    failedIds.add("SubconceptId: " + subconceptId + " already exists");  // Subconcept already exists, skip this entry
                    continue;
                }

                Subconcept subconcept = new Subconcept();
                subconcept.setSubconceptId(subconceptId);
                subconcept.setDependency(record[1]);
                subconcept.setShowTo(record[2]);
                subconcept.setSubconceptDesc(record[3]);
                subconcept.setSubconceptDesc2(record[4]);
                subconcept.setSubconceptGroup(record[5]);
                subconcept.setSubconceptLink(record[6]);
                subconcept.setSubconceptType(record[7]);
                subconcept.setNumQuestions(Integer.parseInt(record[8]));
                subconcept.setSubconceptMaxscore(Integer.parseInt(record[9]));
                subconcept.setUuid(UUID.randomUUID().toString()); // Auto-generate UUID

                // Fetch and set Concept and ContentMaster
                Optional<Concept> concept = conceptRepository.findById(record[10]); 
                Optional<ContentMaster> content = contentRepository.findById(Integer.parseInt(record[11])); 

                if (concept.isEmpty()) {
                    failedCount++;
                    failedIds.add("SubconceptId: " + subconceptId + " failed - ConceptId: " + record[10] + " not found");
                    continue;
                }

                if (content.isEmpty()) {
                    failedCount++;
                    failedIds.add("SubconceptId: " + subconceptId + " failed - ContentId: " + record[11] + " not found");
                    continue;
                }
                    subconcept.setConcept(concept.get());
                    subconcept.setContent(content.get());
                    subconceptRepository.save(subconcept);
                    createdCount++;
                
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process CSV file: " + e.getMessage());
        }

        result.put("createdCount", createdCount);
        result.put("failedCount", failedCount);
        result.put("failedIds", failedIds);
        return result;
    }
    
    @Override
    public Subconcept updateSubconcept(String subconceptId, Subconcept subconcept) {
        return subconceptRepository.findById(subconceptId).map(existingSubconcept -> {
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
            return subconceptRepository.save(existingSubconcept);
        }).orElseThrow(() -> new RuntimeException("Subconcept not found"));
    }

 

    @Override
    public Map<String, Object> updateSubconceptsCSV(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        int updatedCount = 0;
        int failedCount = 0;
        int notFoundCount = 0;
        List<String> failedIds = new ArrayList<>();
        List<String> notFoundIds = new ArrayList<>();
        List<String> updateLogs = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();
            
            // Validate header row exists
            if (records.isEmpty()) {
                throw new RuntimeException("CSV file is empty");
            }
            
            // Read and validate header row
            String[] headers = records.get(0);
            Map<String, Integer> headerMap = new HashMap<>();
            
            // Create header mapping
            for (int i = 0; i < headers.length; i++) {
                headerMap.put(headers[i].trim().toLowerCase(), i);
            }
            
            // Validate required subconceptId column exists
            if (!headerMap.containsKey("subconceptid")) {
                throw new RuntimeException("CSV must contain 'subconceptId' column");
            }
            
            int subconceptIdIndex = headerMap.get("subconceptid");
            
            // Process data rows
            for (int i = 1; i < records.size(); i++) {
                String[] record = records.get(i);
                
                // Skip rows with insufficient data
                if (record.length <= subconceptIdIndex) {
                    failedCount++;
                    failedIds.add("Row " + (i + 1) + ": Missing subconceptId column");
                    continue;
                }
                
                String subconceptId = record[subconceptIdIndex].trim();
                
                // Skip empty subconcept IDs
                if (subconceptId.isEmpty()) {
                    failedCount++;
                    failedIds.add("Row " + (i + 1) + ": Empty SubconceptId");
                    continue;
                }

                // Check if subconcept exists
                Optional<Subconcept> existingSubconceptOpt = subconceptRepository.findById(subconceptId);
                if (existingSubconceptOpt.isEmpty()) {
                    notFoundCount++;
                    notFoundIds.add("SubconceptId: " + subconceptId + " not found");
                    continue;
                }

                try {
                    Subconcept existingSubconcept = existingSubconceptOpt.get();
                    List<String> updatedFields = new ArrayList<>();
                    boolean hasUpdates = false;
                    
                    // Update dependency if provided and not empty
                    if (headerMap.containsKey("dependency") && 
                        record.length > headerMap.get("dependency") && 
                        !record[headerMap.get("dependency")].trim().isEmpty()) {
                        existingSubconcept.setDependency(record[headerMap.get("dependency")].trim());
                        updatedFields.add("dependency");
                        hasUpdates = true;
                    }
                    
                    // Update showTo if provided and not empty
                    if (headerMap.containsKey("showto") && 
                        record.length > headerMap.get("showto") && 
                        !record[headerMap.get("showto")].trim().isEmpty()) {
                        existingSubconcept.setShowTo(record[headerMap.get("showto")].trim());
                        updatedFields.add("showTo");
                        hasUpdates = true;
                    }
                    
                    // Update subconceptDesc if provided and not empty
                    if (headerMap.containsKey("subconceptdesc") && 
                        record.length > headerMap.get("subconceptdesc") && 
                        !record[headerMap.get("subconceptdesc")].trim().isEmpty()) {
                        existingSubconcept.setSubconceptDesc(record[headerMap.get("subconceptdesc")].trim());
                        updatedFields.add("subconceptDesc");
                        hasUpdates = true;
                    }
                    
                    // Update subconceptDesc2 if provided and not empty
                    if (headerMap.containsKey("subconceptdesc2") && 
                        record.length > headerMap.get("subconceptdesc2") && 
                        !record[headerMap.get("subconceptdesc2")].trim().isEmpty()) {
                        existingSubconcept.setSubconceptDesc2(record[headerMap.get("subconceptdesc2")].trim());
                        updatedFields.add("subconceptDesc2");
                        hasUpdates = true;
                    }
                    
                    // Update subconceptGroup if provided and not empty
                    if (headerMap.containsKey("subconceptgroup") && 
                        record.length > headerMap.get("subconceptgroup") && 
                        !record[headerMap.get("subconceptgroup")].trim().isEmpty()) {
                        existingSubconcept.setSubconceptGroup(record[headerMap.get("subconceptgroup")].trim());
                        updatedFields.add("subconceptGroup");
                        hasUpdates = true;
                    }
                    
                    // Update subconceptLink if provided and not empty
                    if (headerMap.containsKey("subconceptlink") && 
                        record.length > headerMap.get("subconceptlink") && 
                        !record[headerMap.get("subconceptlink")].trim().isEmpty()) {
                        existingSubconcept.setSubconceptLink(record[headerMap.get("subconceptlink")].trim());
                        updatedFields.add("subconceptLink");
                        hasUpdates = true;
                    }
                    
                    // Update subconceptType if provided and not empty
                    if (headerMap.containsKey("subconcepttype") && 
                        record.length > headerMap.get("subconcepttype") && 
                        !record[headerMap.get("subconcepttype")].trim().isEmpty()) {
                        existingSubconcept.setSubconceptType(record[headerMap.get("subconcepttype")].trim());
                        updatedFields.add("subconceptType");
                        hasUpdates = true;
                    }
                    
                    // Update numQuestions if provided and not empty
                    if (headerMap.containsKey("numquestions") && 
                        record.length > headerMap.get("numquestions") && 
                        !record[headerMap.get("numquestions")].trim().isEmpty()) {
                        try {
                            int numQuestions = Integer.parseInt(record[headerMap.get("numquestions")].trim());
                            if (numQuestions < 0) {
                                failedCount++;
                                failedIds.add("SubconceptId: " + subconceptId + " failed - NumQuestions cannot be negative");
                                continue;
                            }
                            existingSubconcept.setNumQuestions(numQuestions);
                            updatedFields.add("numQuestions");
                            hasUpdates = true;
                        } catch (NumberFormatException e) {
                            failedCount++;
                            failedIds.add("SubconceptId: " + subconceptId + " failed - Invalid number format for NumQuestions");
                            continue;
                        }
                    }
                    
                    // Update subconceptMaxscore if provided and not empty
                    if (headerMap.containsKey("subconceptmaxscore") && 
                        record.length > headerMap.get("subconceptmaxscore") && 
                        !record[headerMap.get("subconceptmaxscore")].trim().isEmpty()) {
                        try {
                            int maxScore = Integer.parseInt(record[headerMap.get("subconceptmaxscore")].trim());
                            if (maxScore < 0) {
                                failedCount++;
                                failedIds.add("SubconceptId: " + subconceptId + " failed - MaxScore cannot be negative");
                                continue;
                            }
                            existingSubconcept.setSubconceptMaxscore(maxScore);
                            updatedFields.add("subconceptMaxscore");
                            hasUpdates = true;
                        } catch (NumberFormatException e) {
                            failedCount++;
                            failedIds.add("SubconceptId: " + subconceptId + " failed - Invalid number format for MaxScore");
                            continue;
                        }
                    }

                    // Note: Concept and Content are not updated as per requirement
                    // These fields are ignored even if present in CSV
                    
                    // Save only if there are updates
                    if (hasUpdates) {
                        subconceptRepository.save(existingSubconcept);
                        updatedCount++;
                        updateLogs.add("SubconceptId: " + subconceptId + " updated fields: " + String.join(", ", updatedFields));
                    } else {
                        updateLogs.add("SubconceptId: " + subconceptId + " - No fields to update (all provided fields were empty)");
                    }
                    
                } catch (Exception e) {
                    failedCount++;
                    failedIds.add("SubconceptId: " + subconceptId + " failed - " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
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
        
        return result;
    }
    
    @Override
    public void deleteSubconcept(String subconceptId) {
        subconceptRepository.deleteById(subconceptId);
    }
    
    // Convert Sub concept entity to SubconceptResponseDTO
    private SubconceptResponseDTO convertToDTO(Subconcept subconcept) {
        SubconceptResponseDTO dto = new SubconceptResponseDTO();
        dto.setSubconceptId(subconcept.getSubconceptId());
        dto.setDependency(subconcept.getDependency());
        dto.setSubconceptMaxscore(subconcept.getSubconceptMaxscore());
        dto.setSubconceptDesc(subconcept.getSubconceptDesc());
        dto.setSubconceptGroup(subconcept.getSubconceptGroup());
        dto.setSubconceptType(subconcept.getSubconceptType());
        dto.setSubconceptLink(subconcept.getSubconceptLink());

        return dto;
    }
}

