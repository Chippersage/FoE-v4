package com.FlowofEnglish.service;


import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.repository.CohortRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CohortServiceImpl implements CohortService {

    @Autowired
    private CohortRepository cohortRepository;

    @Override
    public List<Cohort> getAllCohorts() {
        return cohortRepository.findAll();
    }

    @Override
    public Optional<Cohort> getCohortById(String cohortId) {
        return cohortRepository.findById(cohortId);
    }

    @Override
    public List<Cohort> getCohortsByOrganizationId(String organizationId) {
        return cohortRepository.findByOrganizationOrganizationId(organizationId);
    }

    @Override
    public Cohort createCohort(Cohort cohort) {
        return cohortRepository.save(cohort);
    }

    @Override
    public Cohort updateCohort(String cohortId, Cohort updatedCohort) {
        return cohortRepository.findById(cohortId)
                .map(cohort -> {
                    cohort.setCohortDesc(updatedCohort.getCohortDesc());
                    cohort.setCohortEndDate(updatedCohort.getCohortEndDate());
                    cohort.setCohortStartDate(updatedCohort.getCohortStartDate());
                    cohort.setOrganization(updatedCohort.getOrganization());
                    return cohortRepository.save(cohort);
                })
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found"));
    }

    @Override
    public void deleteCohort(String cohortId) {
        cohortRepository.deleteById(cohortId);
    }
}

