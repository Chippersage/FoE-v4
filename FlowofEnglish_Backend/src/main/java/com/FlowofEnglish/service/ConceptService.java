package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Concept;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface ConceptService {
    List<Concept> getAllConcepts();
    Optional<Concept> getConceptById(String conceptId);
    Concept createConcept(Concept concept);
    Concept updateConcept(String conceptId, Concept concept);
    void deleteConcept(String conceptId);
    Map<String, Object> bulkUploadConcepts(MultipartFile file);
}