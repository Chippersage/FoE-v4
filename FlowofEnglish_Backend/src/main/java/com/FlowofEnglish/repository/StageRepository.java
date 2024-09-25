package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Stage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StageRepository extends JpaRepository<Stage, String> {
	List<Stage> findByProgram_ProgramId(String programId);
	// Custom query methods can be added here if necessary
}
