package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.ContentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentMasterRepository extends JpaRepository<ContentMaster, Integer> {
}
