package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ProgramSubscription;
import com.FlowofEnglish.repository.ProgramSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgramSubscriptionServiceImpl implements ProgramSubscriptionService {

    @Autowired
    private ProgramSubscriptionRepository subscriptionRepository;

    @Override
    public ProgramSubscription createProgramSubscription(ProgramSubscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    @Override
    public ProgramSubscription updateProgramSubscription(Long subscriptionId, ProgramSubscription subscriptionDetails) {
        Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findById(subscriptionId);
        if (existingSubscription.isPresent()) {
            ProgramSubscription subscription = existingSubscription.get();
            subscription.setProgram(subscriptionDetails.getProgram());
            subscription.setOrganization(subscriptionDetails.getOrganization());
            subscription.setStartDate(subscriptionDetails.getStartDate());
            subscription.setEndDate(subscriptionDetails.getEndDate());
            subscription.setMaxCohorts(subscriptionDetails.getMaxCohorts());
            return subscriptionRepository.save(subscription);
        }
        return null; // Or throw an exception
    }

    @Override
    public Optional<ProgramSubscription> getProgramSubscription(Long subscriptionId) {
        return subscriptionRepository.findById(subscriptionId);
    }

    @Override
    public List<ProgramSubscription> getAllProgramSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @Override
    public List<ProgramSubscription> getProgramSubscriptionsByOrganization(String organizationId) {
        return subscriptionRepository.findByOrganization_OrganizationId(organizationId);
    }

    @Override
    public void deleteProgramSubscription(Long subscriptionId) {
        subscriptionRepository.deleteById(subscriptionId);
    }
}
