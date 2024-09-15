package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.CohortProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CohortProgramRepository extends JpaRepository<CohortProgram, Long> {
    // Add custom query methods if needed
}
