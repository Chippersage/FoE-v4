package com.FlowofEnglish.service;



import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.repository.SubconceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubconceptServiceImpl implements SubconceptService {

    @Autowired
    private SubconceptRepository subconceptRepository;

    @Override
    public List<Subconcept> getAllSubconcepts() {
        return subconceptRepository.findAll();
    }

    @Override
    public Optional<Subconcept> getSubconceptById(String subconceptId) {
        return subconceptRepository.findById(subconceptId);
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
}

