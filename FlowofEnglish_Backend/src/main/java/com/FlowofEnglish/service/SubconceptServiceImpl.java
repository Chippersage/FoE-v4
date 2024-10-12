package com.FlowofEnglish.service;



import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.repository.SubconceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubconceptServiceImpl implements SubconceptService {

    @Autowired
    private SubconceptRepository subconceptRepository;
    
   
   
    @Override
    public List<SubconceptResponseDTO> getAllSubconcepts() {
        // Fetch all subconcepts and convert them to DTOs
        return subconceptRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
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
    public Subconcept updateSubconcept(String subconceptId, Subconcept subconcept) {
        return subconceptRepository.findById(subconceptId).map(existingSubconcept -> {
            existingSubconcept.setDependency(subconcept.getDependency());
            existingSubconcept.setShowTo(subconcept.getShowTo());
            existingSubconcept.setSubconceptDesc(subconcept.getSubconceptDesc());
            existingSubconcept.setSubconceptGroup(subconcept.getSubconceptGroup());
            existingSubconcept.setSubconceptLink(subconcept.getSubconceptLink());
            existingSubconcept.setSubconceptTitle(subconcept.getSubconceptTitle());
            existingSubconcept.setSubconceptType(subconcept.getSubconceptType());
            existingSubconcept.setUserType(subconcept.getUserType());
            existingSubconcept.setConcept(subconcept.getConcept());
            existingSubconcept.setContent(subconcept.getContent());
            return subconceptRepository.save(existingSubconcept);
        }).orElseThrow(() -> new RuntimeException("Subconcept not found"));
    }

    @Override
    public void deleteSubconcept(String subconceptId) {
        subconceptRepository.deleteById(subconceptId);
    }
    
    // Convert Subconcept entity to SubconceptResponseDTO
    private SubconceptResponseDTO convertToDTO(Subconcept subconcept) {
        SubconceptResponseDTO dto = new SubconceptResponseDTO();
        dto.setSubconceptId(subconcept.getSubconceptId());
        dto.setDependency(subconcept.getDependency());
        dto.setShowTo(subconcept.getShowTo());
        dto.setSubconceptDesc(subconcept.getSubconceptDesc());
        dto.setSubconceptGroup(subconcept.getSubconceptGroup());
        dto.setSubconceptTitle(subconcept.getSubconceptTitle());
        dto.setSubconceptType(subconcept.getSubconceptType());
        dto.setSubconceptLink(subconcept.getSubconceptLink());
        dto.setCompletionStatus("no");  // You can update this based on your logic
        

        return dto;
    }
}

