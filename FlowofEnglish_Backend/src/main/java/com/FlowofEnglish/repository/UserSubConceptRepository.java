package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSubConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSubConceptRepository extends JpaRepository<UserSubConcept, Long> {
}
