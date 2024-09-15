package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, String> {

    // Custom query to find cohorts by organization ID
    List<Cohort> findByOrganizationOrganizationId(String organizationId);
}
