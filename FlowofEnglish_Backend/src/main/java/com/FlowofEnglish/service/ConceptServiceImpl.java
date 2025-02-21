package com.FlowofEnglish.service;


import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import com.FlowofEnglish.dto.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

@Service
public class ConceptServiceImpl implements ConceptService {

    @Autowired
    private ConceptRepository conceptRepository;

    @Autowired
    private ContentMasterRepository contentRepository;

    @Override
    public List<Concept> getAllConcepts() {
        return conceptRepository.findAll();
    }

    @Override
    public Optional<Concept> getConceptById(String conceptId) {
        return conceptRepository.findById(conceptId);
    }

    @Override
    public Concept createConcept(Concept concept) {
        return conceptRepository.save(concept);
    }

    @Override
    public Map<String, Object> bulkUploadConcepts(MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        List<String> successIds = new ArrayList<>();
        List<String> failedIds = new ArrayList<>();
        int totalInserted = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            Set<String> conceptIdsSeenInFile = new HashSet<>();
            
         // Skip the header row
            reader.readLine(); 
            
            while ((line = reader.readLine()) != null) {
                String[] fields = line.split(",");
                
                // Assuming CSV columns are: conceptId, conceptName, conceptDesc, conceptSkill1, conceptSkill2, contentId
                String conceptId = fields[0];
                String conceptName = fields[1];
                String conceptDesc = fields[2];
                String conceptSkill1 = fields[3];
                String conceptSkill2 = fields[4];
                String contentId = fields[5];

                // Skip duplicate conceptIds within the same file
                if (conceptIdsSeenInFile.contains(conceptId)) {
                    failedIds.add(conceptId + " (duplicate in file)");
                    continue;
                }

                conceptIdsSeenInFile.add(conceptId);

                // Check if the conceptId already exists in the database
                if (conceptRepository.existsById(conceptId)) {
                    failedIds.add(conceptId + " (already exists)");
                    continue;
                }

                // Fetch the associated ContentMaster by contentId
             // Fetch the associated ContentMaster by contentId, converting String to Integer
                try {
                    Integer contentIdInteger = Integer.parseInt(contentId);
                    Optional<ContentMaster> contentOptional = contentRepository.findById(contentIdInteger);
                    if (!contentOptional.isPresent()) {
                        failedIds.add(conceptId + " (invalid contentId)");
                        continue;
                    }

                    // Create a new Concept entity
                    ContentMaster content = contentOptional.get();
                    Concept concept = new Concept(conceptId, conceptName, conceptDesc, conceptSkill1, conceptSkill2, UUID.randomUUID().toString(), content);

                    // Save to the database
                    conceptRepository.save(concept);
                    successIds.add(conceptId);
                    totalInserted++;
                } catch (NumberFormatException e) {
                    failedIds.add(conceptId + " (contentId not a valid number)");
                    continue;
                }

            }

            // Build the response
            response.put("successfulIds", successIds);
            response.put("failedIds", failedIds);
            response.put("totalInserted", totalInserted);
            response.put("totalFailed", failedIds.size());

        } catch (Exception e) {
            throw new RuntimeException("Error reading CSV file", e);
        }

        return response;
    }
    
    @Override
    public Concept updateConcept(String conceptId, Concept concept) {
        return conceptRepository.findById(conceptId).map(existingConcept -> {
            existingConcept.setConceptDesc(concept.getConceptDesc());
            existingConcept.setConceptSkill1(concept.getConceptSkill1());
            existingConcept.setConceptSkill2(concept.getConceptSkill2());
            existingConcept.setContent(concept.getContent());
            return conceptRepository.save(existingConcept);
        }).orElseThrow(() -> new RuntimeException("Concept not found"));
    }

    @Override
    public void deleteConcept(String conceptId) {
        conceptRepository.deleteById(conceptId);
    }
    
    /**
     * Groups subconcepts by their parent concepts for a given stage
     * @param stageReport The stage report containing units and their subconcepts
     * @return Map of concepts to their associated subconcepts
     */
    @Override
    public Map<ConceptDTO, List<SubconceptReportStageDTO>> groupSubconceptsByConcept(
            StageReportStageDTO stageReport,
            Map<String, ConceptDTO> subconceptConceptMap) {

        Map<ConceptDTO, List<SubconceptReportStageDTO>> conceptMapping = new HashMap<>();

        // Process each unit in the stage
        for (UnitReportStageDTO unit : stageReport.getUnits()) {
            // Process each subconcept in the unit
            for (SubconceptReportStageDTO subconcept : unit.getSubconcepts()) {
                // Retrieve the associated concept from the lookup using the subconcept ID.
                ConceptDTO concept = subconceptConceptMap.get(subconcept.getSubconceptId());
                if (concept == null) {
                    // Skip if no concept is associated with this subconcept.
                    continue;
                }
                // Group subconcepts under their concept.
                conceptMapping.computeIfAbsent(concept, k -> new ArrayList<>()).add(subconcept);
            }
        }

        return conceptMapping;
    }

    /**
     * Creates a summary of concepts and their subconcepts with progress metrics
     * @param conceptMapping Map of concepts to their subconcepts
     * @return List of concept summaries with progress information
     */
    @Override
    public List<ConceptSummaryDTO> generateConceptSummaries(Map<ConceptDTO, List<SubconceptReportDTO>> conceptMapping) {
        List<ConceptSummaryDTO> summaries = new ArrayList<>();
        
        for (Map.Entry<ConceptDTO, List<SubconceptReportDTO>> entry : conceptMapping.entrySet()) {
            ConceptSummaryDTO summary = new ConceptSummaryDTO();
            ConceptDTO concept = entry.getKey();
            List<SubconceptReportDTO> subconcepts = entry.getValue();
            
            summary.setConceptId(concept.getConceptId());
            summary.setConceptName(concept.getConceptName());
            summary.setConceptDesc(concept.getConceptDesc());
            summary.setConceptSkills(Arrays.asList(concept.getConceptSkill1(), concept.getConceptSkill2()));
            summary.setContent(concept.getContent());
            summary.setTotalSubconcepts(subconcepts.size());
            summary.setCompletedSubconcepts((int) subconcepts.stream()
                .filter(SubconceptReportDTO::isCompleted)
                .count());
            summary.setAverageScore(calculateAverageScore(subconcepts));
            summary.setSubconcepts(subconcepts);
            
            summaries.add(summary);
        }
        
        return summaries;
    }
    
    private double calculateAverageScore(List<SubconceptReportDTO> subconcepts) {
        return subconcepts.stream()
            .mapToDouble(SubconceptReportDTO::getHighestScore)
            .filter(score -> score > 0)
            .average()
            .orElse(0.0);
    }

}
