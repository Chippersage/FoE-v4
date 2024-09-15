package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserAttempts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAttemptsRepository extends JpaRepository<UserAttempts, Integer> {
    // Custom query methods can be added here if necessary
}
