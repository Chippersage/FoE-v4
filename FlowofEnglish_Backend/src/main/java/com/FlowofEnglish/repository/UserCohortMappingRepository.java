package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserCohortMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCohortMappingRepository extends JpaRepository<UserCohortMapping, Integer> {

    Optional<UserCohortMapping> findByUserUserId(String userId);

    List<UserCohortMapping> findAllByUserUserId(String userId);

    void deleteByUserUserId(String userId);
}
