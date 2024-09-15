package com.FlowofEnglish.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.FlowofEnglish.model.Organization;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
    
    // Custom query to find Organization by admin email
    Organization findByOrganizationAdminEmail(String email);
}
