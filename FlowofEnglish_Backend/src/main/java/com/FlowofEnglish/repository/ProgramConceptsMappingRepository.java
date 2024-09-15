package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.ProgramConceptsMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramConceptsMappingRepository extends JpaRepository<ProgramConceptsMapping, String> {
    // Custom query methods can be added here
}
