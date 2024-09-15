package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserCohortMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCohortMappingRepository extends JpaRepository<UserCohortMapping, Integer> {
    // Custom query methods can be added here if necessary
}
