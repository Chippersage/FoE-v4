package com.FlowofEnglish.service;


import com.FlowofEnglish.model.Concept;
import com.FlowofEnglish.model.ContentMaster;
import com.FlowofEnglish.repository.ConceptRepository;
import com.FlowofEnglish.repository.ContentMasterRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

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
}
