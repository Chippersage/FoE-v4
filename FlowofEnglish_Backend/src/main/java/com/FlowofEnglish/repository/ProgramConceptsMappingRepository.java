package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.ProgramConceptsMapping;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramConceptsMappingRepository extends JpaRepository<ProgramConceptsMapping, Long> {
	// Custom query method to find mappings by unitId
    List<ProgramConceptsMapping> findByUnit_UnitId(String unitId);
	
	// Custom query methods can be added here
}
