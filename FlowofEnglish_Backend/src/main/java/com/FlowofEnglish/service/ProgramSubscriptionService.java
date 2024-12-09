package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ProgramSubscription;
import java.util.List;
import java.util.Optional;

public interface ProgramSubscriptionService {

    // CRUD operations
    ProgramSubscription createProgramSubscription(ProgramSubscription subscription);
    
    ProgramSubscription updateProgramSubscription(Long subscriptionId, ProgramSubscription subscriptionDetails);
    
    Optional<ProgramSubscription> getProgramSubscription(Long subscriptionId);
    
    List<ProgramSubscription> getAllProgramSubscriptions();
    
    List<ProgramSubscription> getProgramSubscriptionsByOrganization(String organizationId);
    
    void deleteProgramSubscription(Long subscriptionId);
}
