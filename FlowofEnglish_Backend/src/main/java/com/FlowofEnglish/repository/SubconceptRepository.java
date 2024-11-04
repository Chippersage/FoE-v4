package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Subconcept;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubconceptRepository extends JpaRepository<Subconcept, String> {
	Optional<Subconcept> findBySubconceptId(String subconceptId);
	// Custom query methods can be added here
}
