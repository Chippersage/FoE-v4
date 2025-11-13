package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.*;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, String> {

   List<Cohort> findByOrganizationOrganizationId(String organizationId);

   List<Cohort> findByCohortNameAndOrganizationOrganizationId(String cohortName, String orgId);
   
   Optional<Cohort> findByCohortId(String cohortId);
   
   @Query("SELECT COUNT(c) FROM Cohort c WHERE c.cohortName = :cohortName AND c.organization.organizationId = :orgId")
   long countByCohortNameAndOrganization(@Param("cohortName") String cohortName, @Param("orgId") String orgId);
   
   @Query("SELECT c FROM Cohort c WHERE c.cohortEndDate BETWEEN :startDate AND :endDate")
   List<Cohort> findCohortsEndingSoon(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

   @Query("SELECT c, DATEDIFF(c.cohortEndDate, CURRENT_DATE) as daysToEnd " +
            "FROM Cohort c WHERE c.cohortEndDate > CURRENT_DATE")
   List<Object[]> findCohortsWithDaysToEnd();

}
