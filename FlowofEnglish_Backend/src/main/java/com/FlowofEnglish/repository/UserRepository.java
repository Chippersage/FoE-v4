package com.FlowofEnglish.repository;

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
    
   // User findByUserId(String userId);
    
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserId(@Param("userId") String userId);

}
