package com.FlowofEnglish.service;


import com.FlowofEnglish.model.CohortProgram;
import com.FlowofEnglish.repository.CohortProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CohortProgramServiceImpl implements CohortProgramService {

    @Autowired
    private CohortProgramRepository cohortProgramRepository;

    @Override
    public List<CohortProgram> getAllCohortPrograms() {
        return cohortProgramRepository.findAll();
    }

    @Override
    public Optional<CohortProgram> getCohortProgram(Long cohortProgramId) {
    	
        return cohortProgramRepository.findById(cohortProgramId);
    }

    @Override
    public CohortProgram createCohortProgram(CohortProgram cohortProgram) {
    	// Check if cohort already has a program assigned
        Optional<CohortProgram> existingCohortProgram = cohortProgramRepository.findByCohortCohortId(cohortProgram.getCohort().getCohortId());
        if (existingCohortProgram.isPresent()) {
            throw new IllegalArgumentException("The cohort is already assigned to a program.");
        }
        return cohortProgramRepository.save(cohortProgram);
    }

    @Override
    public void deleteCohortProgram(Long cohortProgramId) {
        cohortProgramRepository.deleteById(cohortProgramId);
    }
}

