package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.UserSessionMapping;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSessionMappingRepository extends JpaRepository<UserSessionMapping, String> {
	Optional<UserSessionMapping> findBySessionId(String sessionId);
	List<UserSessionMapping> findByUser_UserId(String userId);
    // Custom query methods can be added here if necessary
}
