package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Custom query to find users by organization ID
    List<User> findByOrganizationOrganizationId(String organizationId);
    
    User findByUserEmail(String userEmail);
    @Query("SELECT u FROM User u WHERE u.userEmail IS NOT NULL")
    List<User> findUsersWithEmail();
   // User findByUserId(String userId);
    
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserId(@Param("userId") String userId);

    @Query("SELECT u FROM User u JOIN u.userCohortMappings ucm " +
 	       "WHERE LOWER(u.userType) = LOWER(:userType) AND ucm.cohort = :cohort")
 	Optional<User> findByUserTypeAndCohort(@Param("userType") String userType, @Param("cohort") Cohort cohort);
 // Find all admins in an organization
    List<User> findByOrganizationAndUserType(Organization organization, String userType);
    
  
}
