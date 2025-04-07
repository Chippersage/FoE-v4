package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {
    List<PaymentEvent> findByPaymentId(String paymentId);
    List<PaymentEvent> findBySubscriptionId(Long subscriptionId);
    List<PaymentEvent> findByEventType(String eventType);
}