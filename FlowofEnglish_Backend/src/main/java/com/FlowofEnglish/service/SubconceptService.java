package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.SubconceptResponseDTO;
import com.FlowofEnglish.model.Subconcept;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface SubconceptService {
	List<Subconcept> getAllSubconcept();
    List<SubconceptResponseDTO> getAllSubconcepts();
    Optional<Subconcept> findBySubconceptId(String subconceptId);
    Optional<SubconceptResponseDTO> getSubconceptById(String subconceptId);
    Subconcept createSubconcept(Subconcept subconcept);
    Subconcept updateSubconcept(String subconceptId, Subconcept subconcept);
    void deleteSubconcept(String subconceptId); 
    Map<String, Object> uploadSubconceptsCSV(MultipartFile file);
    Map<String, Object> updateSubconceptsCSV(MultipartFile file);
}