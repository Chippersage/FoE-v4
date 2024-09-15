package com.FlowofEnglish.service;



import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgramConceptsMappingServiceImpl implements ProgramConceptsMappingService {

    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;

    @Override
    public List<ProgramConceptsMapping> getAllProgramConceptsMappings() {
        return programConceptsMappingRepository.findAll();
    }

    @Override
    public Optional<ProgramConceptsMapping> getProgramConceptsMappingById(String programConceptId) {
        return programConceptsMappingRepository.findById(programConceptId);
    }

    @Override
    public ProgramConceptsMapping createProgramConceptsMapping(ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.save(programConceptsMapping);
    }

    @Override
    public ProgramConceptsMapping updateProgramConceptsMapping(String programConceptId, ProgramConceptsMapping programConceptsMapping) {
        return programConceptsMappingRepository.findById(programConceptId).map(existingMapping -> {
            existingMapping.setProgramConceptDesc(programConceptsMapping.getProgramConceptDesc());
            existingMapping.setConcept(programConceptsMapping.getConcept());
            existingMapping.setContent(programConceptsMapping.getContent());
            existingMapping.setUnit(programConceptsMapping.getUnit());
            existingMapping.setProgram(programConceptsMapping.getProgram());
            existingMapping.setSubconcept(programConceptsMapping.getSubconcept());
            return programConceptsMappingRepository.save(existingMapping);
        }).orElseThrow(() -> new RuntimeException("ProgramConceptsMapping not found"));
    }

    @Override
    public void deleteProgramConceptsMapping(String programConceptId) {
        programConceptsMappingRepository.deleteById(programConceptId);
    }
}

