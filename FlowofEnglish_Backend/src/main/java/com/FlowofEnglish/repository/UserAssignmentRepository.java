package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAssignmentRepository extends JpaRepository<UserAssignment, String> {

    List<UserAssignment> findByUserUserId(String userId);

    List<UserAssignment> findByCohortCohortId(String cohortId);

    List<UserAssignment> findByCohortCohortIdAndUserUserId(String cohortId, String userId);
}
