package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {

    SuperAdmin findByUserId(String userId);
}
