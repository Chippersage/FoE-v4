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

