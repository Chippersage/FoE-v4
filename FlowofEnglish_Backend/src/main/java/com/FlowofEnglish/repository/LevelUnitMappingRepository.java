package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.LevelUnitMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelUnitMappingRepository extends JpaRepository<LevelUnitMapping, String> {
    // Add custom query methods if needed
}
