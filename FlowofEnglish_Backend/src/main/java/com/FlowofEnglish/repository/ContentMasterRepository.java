package com.FlowofEnglish.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.FlowofEnglish.model.ContentMaster;

@Repository
public interface ContentMasterRepository extends JpaRepository<ContentMaster, Integer> {
}
