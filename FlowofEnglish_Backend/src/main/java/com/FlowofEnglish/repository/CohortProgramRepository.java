package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.CohortProgram;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CohortProgramRepository extends JpaRepository<CohortProgram, Long> {
    
	Optional<CohortProgram> findByCohortCohortId(String cohortId);
	List<CohortProgram> findAllByCohort_CohortId(String cohortId);
}
