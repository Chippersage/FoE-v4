package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Unit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {
	List<Unit> findByStage_StageId(String stageId);
	// You can add custom queries here if necessary
}
