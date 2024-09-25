package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.Subconcept;

import java.util.List;
import java.util.Optional;

public interface SubconceptService {
    List<SubconceptResponseDTO> getAllSubconcepts();
    Optional<SubconceptResponseDTO> getSubconceptById(String subconceptId);
    Subconcept createSubconcept(Subconcept subconcept);
    Subconcept updateSubconcept(String subconceptId, Subconcept subconcept);
    void deleteSubconcept(String subconceptId);
    
}
