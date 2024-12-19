package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, String> {

    List<Cohort> findByOrganizationOrganizationId(String organizationId);
    
 // Custom method to count cohorts by cohort name and organization ID
    long countByCohortNameAndOrganizationOrganizationId(String cohortName, String orgId);
    
    @Query("SELECT c FROM Cohort c WHERE c.cohortEndDate BETWEEN :startDate AND :endDate")
    List<Cohort> findCohortsEndingSoon(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT c, DATEDIFF(c.cohortEndDate, CURRENT_DATE) as daysToEnd " +
    	       "FROM Cohort c WHERE c.cohortEndDate > CURRENT_DATE")
    	List<Object[]> findCohortsWithDaysToEnd();

}
