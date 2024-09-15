package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Subconcept;
import java.util.List;
import java.util.Optional;

public interface SubconceptService {
    List<Subconcept> getAllSubconcepts();
    Optional<Subconcept> getSubconceptById(String subconceptId);
    Subconcept createSubconcept(Subconcept subconcept);
    Subconcept updateSubconcept(String subconceptId, Subconcept subconcept);
    void deleteSubconcept(String subconceptId);
}
