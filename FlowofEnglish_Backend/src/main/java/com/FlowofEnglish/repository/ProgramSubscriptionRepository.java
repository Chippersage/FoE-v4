package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.ProgramSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramSubscriptionRepository extends JpaRepository<ProgramSubscription, Long> {
    // Custom query to find subscriptions by organization ID
    List<ProgramSubscription> findByOrganization_OrganizationId(String organizationId);
    Optional<ProgramSubscription> findByTransactionId(String transactionId);
}
