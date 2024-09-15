package com.FlowofEnglish.service;


import com.FlowofEnglish.model.Concept;
import com.FlowofEnglish.repository.ConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConceptServiceImpl implements ConceptService {

    @Autowired
    private ConceptRepository conceptRepository;

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
