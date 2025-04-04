package com.FlowofEnglish.service;


import com.FlowofEnglish.dto.CohortDTO;
import com.FlowofEnglish.exception.CohortValidationException;
import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.repository.CohortRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        // Validate cohort end date
        if (cohort.getCohortEndDate() != null 
                && cohort.getCohortEndDate().isBefore(cohort.getCohortStartDate())) {
            throw new CohortValidationException("Cohort end date must be greater than the cohort start date.");
        }
     // Ensure organization and cohort name are not null
        if (cohort.getCohortName() == null || cohort.getOrganization() == null) {
            throw new CohortValidationException("Cohort name and organization are required.");
        }
        
     // Prepare cohort name and organization details
        String orgId = cohort.getOrganization().getOrganizationId();
        String originalCohortName = cohort.getCohortName();
        String sanitizedCohortName = originalCohortName.replaceAll("\\s+", "");
        
        // Generate name prefix
        String namePrefix = sanitizedCohortName.length() >= 4
                ? sanitizedCohortName.substring(0, 4).toUpperCase()
                : sanitizedCohortName.toUpperCase();

     // Find existing cohorts with the same name in the organization
        long cohortCount = cohortRepository.countByCohortNameAndOrganization(originalCohortName, orgId);
        
        // Generate unique cohort ID
        String newCohortId = namePrefix + "-" + orgId + "-" + (cohortCount + 1);
        cohort.setCohortId(newCohortId);

        // Generate UUID if not present
        if (cohort.getUuid() == null) {
            cohort.setUuid(UUID.randomUUID().toString());
        }

        // Save cohort
        return cohortRepository.save(cohort);
    }


    @Override
    public Cohort updateCohort(String cohortId, Cohort updatedCohort) {
        return cohortRepository.findById(cohortId)
                .map(cohort -> {
                    if (updatedCohort.getCohortEndDate() != null 
                            && updatedCohort.getCohortEndDate().isBefore(cohort.getCohortStartDate())) {
                        throw new CohortValidationException("Cohort end date must be greater than the cohort start date.");
                    }
                    cohort.setCohortName(updatedCohort.getCohortName());
                    cohort.setCohortEndDate(updatedCohort.getCohortEndDate());
                    cohort.setShowLeaderboard(updatedCohort.isShowLeaderboard());
                    cohort.setDelayedStageUnlock(updatedCohort.isDelayedStageUnlock());
                    cohort.setDelayInDays(updatedCohort.getDelayInDays());
                    cohort.setOrganization(updatedCohort.getOrganization());
                    return cohortRepository.save(cohort);
                })
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found with ID: " + cohortId));
    }



    @Override
    public void deleteCohort(String cohortId) {
        if (!cohortRepository.existsById(cohortId)) {
            throw new IllegalArgumentException("Cohort not found with id: " + cohortId);
        }
        cohortRepository.deleteById(cohortId);
    }
    
 // Implementation of convertToDTO method
    @Override
    public CohortDTO convertToDTO(Cohort cohort) {
        CohortDTO dto = new CohortDTO();
        dto.setCohortId(cohort.getCohortId());
        dto.setCohortName(cohort.getCohortName());
        return dto;
    }
}

