package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Concept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConceptRepository extends JpaRepository<Concept, String> {
}
