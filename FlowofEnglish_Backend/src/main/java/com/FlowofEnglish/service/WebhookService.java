package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.json.JSONObject;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class WebhookService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);
    
    @Autowired
    private ProgramSubscriptionRepository subscriptionRepository;
    
    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private PaymentEventRepository paymentEventRepository;
      
 // Payment status constants
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_AUTHORIZED = "AUTHORIZED";
    private static final String STATUS_PAID = "PAID";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_DISPUTED = "DISPUTED";
    
    @Transactional
    public void processWebhookEvent(String eventType, JSONObject payload) {
        logger.info("Processing event type: {}", eventType);
        
        try {
            JSONObject paymentEntity = null;
            JSONObject orderEntity = null;
            String paymentId = null;
            String orderId = null;
            
         // Extract the entities based on event type
            switch (eventType) {
                case "payment.authorized":
                case "payment.captured":
                case "payment.failed":
                    paymentEntity = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                    paymentId = paymentEntity.getString("id");
                    orderId = paymentEntity.has("order_id") ? paymentEntity.getString("order_id") : null;
                    break;
                    
                case "order.paid":
                    orderEntity = payload.getJSONObject("payload").getJSONObject("order").getJSONObject("entity");
                    paymentEntity = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                    paymentId = paymentEntity.getString("id");
                    orderId = orderEntity.getString("id");
                    break;
                    
                case "payment.dispute.created":
                case "payment.dispute.won":
                case "payment.dispute.lost":
                    paymentEntity = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                    paymentId = paymentEntity.getString("id");
                    handlePaymentDispute(paymentEntity, eventType);
                    break;
                    
                case "refund.created":
                case "refund.processed":
                case "refund.failed":
                    JSONObject refundEntity = payload.getJSONObject("payload").getJSONObject("refund").getJSONObject("entity");
                    paymentId = refundEntity.getString("payment_id");
                    handleRefund(refundEntity, eventType);
                    break;
                    
                default:
                    logger.info("Unhandled event type: {}", eventType);
                    recordPaymentEvent(eventType, payload, null, null);
                    return;
            }
         // Find associated subscription
            Optional<ProgramSubscription> subscriptionOpt;
            Long subscriptionId = null;
            
            if (paymentId != null) {
                subscriptionOpt = subscriptionRepository.findByTransactionId(paymentId);
                if (!subscriptionOpt.isPresent() && orderId != null) {
                    subscriptionOpt = subscriptionRepository.findByTransactionId(orderId);
                }
            } else if (orderId != null) {
                subscriptionOpt = subscriptionRepository.findByTransactionId(orderId);
            } else {
                subscriptionOpt = Optional.empty();
            }
            
            if (subscriptionOpt.isPresent()) {
                subscriptionId = subscriptionOpt.get().getSubscriptionId();
            }
            
            // Record the payment event
            PaymentEvent event = recordPaymentEvent(eventType, payload, paymentId, orderId);
            
            // Fix for NullPointerException - check if event is null
            if (event != null && subscriptionId != null) {
                event.setSubscriptionId(subscriptionId);
                paymentEventRepository.save(event);
            }
            
            // Process different event types
            switch (eventType) {
            case "payment.captured":
                handlePaymentCaptured(paymentEntity);
                break;
            case "payment.failed":
                handlePaymentFailed(paymentEntity);
                break;
            case "order.paid":
                handleOrderPaid(orderEntity, paymentEntity);
                break;
        }
        
    } catch (Exception e) {
        logger.error("Error processing webhook: {}", e.getMessage(), e);
        throw new RuntimeException("Error processing webhook event", e);
    }
}
    
    private PaymentEvent recordPaymentEvent(String eventType, JSONObject payload, String paymentId, String orderId) {
        try {
            PaymentEvent event = new PaymentEvent();
            event.setEventType(eventType);
            event.setPaymentId(paymentId);
            event.setOrderId(orderId);
            
            // Extract amount and error details if available
            Double amount = null;
            String status = null;
            String errorCode = null;
            String errorDescription = null;
            
            if (payload.has("payload")) {
                JSONObject payloadObj = payload.getJSONObject("payload");
                
                if (payloadObj.has("payment") && payloadObj.getJSONObject("payment").has("entity")) {
                    JSONObject payment = payloadObj.getJSONObject("payment").getJSONObject("entity");
                    if (payment.has("amount")) {
                        amount = payment.getDouble("amount") / 100.0;
                    }
                    if (payment.has("status")) {
                        status = payment.getString("status");
                    }
                    
                    // error_code handling
                    if (payment.has("error_code") && !payment.isNull("error_code")) {
                        Object error = payment.get("error_code");
                        errorCode = String.valueOf(error);
                    }
                    
                    // error_description handling
                    if (payment.has("error_description") && !payment.isNull("error_description")) {
                        Object error = payment.get("error_description");
                        errorDescription = String.valueOf(error);
                    }
                }
            }
            
            event.setAmount(amount);
            event.setStatus(status);
            event.setErrorCode(errorCode);
            event.setErrorDescription(errorDescription);
            event.setRawPayload(payload.toString());
            
            return paymentEventRepository.save(event);
        } catch (Exception e) {
            logger.error("Error recording payment event: {}", e.getMessage(), e);
            return null;
        }
    }
    
    private void handlePaymentAuthorized(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.has("order_id") ? paymentEntity.getString("order_id") : null;
        double amount = paymentEntity.getDouble("amount") / 100.0; // Convert from paise to rupees
        
        logger.info("Payment authorized: Payment ID={}, Order ID={}, Amount={}", paymentId, orderId, amount);
        
        // Create subscription with AUTHORIZED status
        try {
            createOrUpdateSubscription(paymentEntity, STATUS_AUTHORIZED);
        } catch (Exception e) {
            logger.error("Error creating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification logic here if needed
    }
    
    private void handlePaymentCaptured(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.getString("order_id");
        double amount = paymentEntity.getDouble("amount") / 100.0; // Convert from paise to rupees
        
        logger.info("Payment captured: Payment ID={}, Order ID={}, Amount={}", paymentId, orderId, amount);
        
        // Update existing subscription or create new one with PAID status
        try {
            Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findByTransactionId(paymentId);
            
            if (existingSubscription.isPresent()) {
                ProgramSubscription subscription = existingSubscription.get();
                subscription.setStatus(STATUS_PAID);
                subscription.setTransactionDate(OffsetDateTime.now());
                subscriptionRepository.save(subscription);
                logger.info("Updated subscription status to PAID: {}", subscription.getSubscriptionId());
            } else {
                createOrUpdateSubscription(paymentEntity, STATUS_PAID);
            }
        } catch (Exception e) {
            logger.error("Error updating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification logic here if needed
    }
    
    private void handlePaymentFailed(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.has("order_id") ? paymentEntity.getString("order_id") : "N/A";
        double amount = paymentEntity.getDouble("amount") / 100.0; // Convert from paise to rupees
        String errorCode = paymentEntity.has("error_code") ? paymentEntity.getString("error_code") : "unknown";
        String errorDescription = paymentEntity.has("error_description") ? paymentEntity.getString("error_description") : "Unknown error";
        
        logger.info("Payment failed: Payment ID={}, Order ID={}, Amount={}, Error={}", paymentId, orderId, amount, errorCode);
        
        // Create or update subscription with FAILED status
        try {
            Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findByTransactionId(paymentId);
            
            if (existingSubscription.isPresent()) {
                ProgramSubscription subscription = existingSubscription.get();
                subscription.setStatus(STATUS_FAILED);
                subscription.setTransactionDate(OffsetDateTime.now());
                subscriptionRepository.save(subscription);
                logger.info("Updated subscription status to FAILED: {}", subscription.getSubscriptionId());
            } else {
                createOrUpdateSubscription(paymentEntity, STATUS_FAILED);
            }
        } catch (Exception e) {
            logger.error("Error updating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification logic here if needed
    }
    
    private void handleOrderPaid(JSONObject orderEntity, JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = orderEntity.getString("id");
        double amount = paymentEntity.getDouble("amount") / 100.0; // Convert from paise to rupees
        
        logger.info("Order paid: Order ID={}, Amount={}", orderId, amount);
        
        // Check if subscription already exists
        Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findByTransactionId(paymentId);
        if (existingSubscription.isPresent()) {
            ProgramSubscription subscription = existingSubscription.get();
            subscription.setStatus(STATUS_PAID);
            subscription.setTransactionDate(OffsetDateTime.now());
            subscriptionRepository.save(subscription);
            logger.info("Updated subscription status to PAID: {}", subscription.getSubscriptionId());
            return;
        }
        
        // Create new subscription with PAID status
        try {
            createOrUpdateSubscription(paymentEntity, STATUS_PAID);
        } catch (Exception e) {
            logger.error("Error creating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification logic here if needed
    }
    
    private void handlePaymentDispute(JSONObject paymentEntity, String eventType) {
        String paymentId = paymentEntity.getString("id");
        logger.info("Payment dispute event: {}, Payment ID={}", eventType, paymentId);
        
        // Update subscription status based on dispute event
        Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findByTransactionId(paymentId);
        if (existingSubscription.isPresent()) {
            ProgramSubscription subscription = existingSubscription.get();
            subscription.setStatus(STATUS_DISPUTED);
            subscriptionRepository.save(subscription);
            logger.info("Updated subscription status to DISPUTED: {}", subscription.getSubscriptionId());
        }
    }
    
    private void handleRefund(JSONObject refundEntity, String eventType) {
        String paymentId = refundEntity.getString("payment_id");
        logger.info("Refund event: {}, Payment ID={}", eventType, paymentId);
        
        // You can implement specific logic for handling refunds based on your business requirements
        // For example, you might want to mark the subscription as "REFUNDED" or reduce the subscription period
    }
    
    @Transactional
    private void createOrUpdateSubscription(JSONObject paymentEntity, String status) {
    	// Only proceed if status is PAID or FAILED
        if (!STATUS_PAID.equals(status) && !STATUS_FAILED.equals(status)) {
            logger.info("Skipping subscription update for status: {}", status);
            return;
        }
        // Extract the necessary data from the payment entity
        String paymentId = paymentEntity.getString("id");
        double amount = paymentEntity.getDouble("amount") / 100.0; // Convert from paise to rupees
        
        // Extract program and organization IDs from notes
        JSONObject notes = paymentEntity.has("notes") ? paymentEntity.getJSONObject("notes") : new JSONObject();
        
        if (!notes.has("program_id") || !notes.has("organization_id")) {
            logger.error("Missing program_id or organization_id in payment notes");
            return;
        }
        
        String programId = notes.getString("program_id");
        String organizationId = notes.getString("organization_id");
        Integer maxCohorts = notes.has("max_cohorts") ? notes.getInt("max_cohorts") : 1;
        
        // Extract user information
        String userEmail = notes.has("email") ? notes.getString("email") : extractEmailFromPayment(paymentEntity);
        String userName = notes.has("name") ? notes.getString("name") : "Unknown User";
        String userPhone = notes.has("contact") ? notes.getString("contact") : null;
        String userAddress = notes.has("address") ? notes.getString("address") : null;
        
        // Fetch program and organization
        Optional<Program> programOpt = programRepository.findByProgramId(programId);
        Optional<Organization> orgOpt = organizationRepository.findById(organizationId);
        
        if (!programOpt.isPresent() || !orgOpt.isPresent()) {
            logger.error("Program or Organization not found. Program ID: {}, Org ID: {}", programId, organizationId);
            return;
        }
        
        Program program = programOpt.get();
        Organization organization = orgOpt.get();
        
        // Check if subscription already exists
        Optional<ProgramSubscription> existingSubscription = subscriptionRepository.findByTransactionId(paymentId);
        ProgramSubscription subscription;
        
        if (existingSubscription.isPresent()) {
            // Update existing subscription
            subscription = existingSubscription.get();
            subscription.setTransactionDate(OffsetDateTime.now());
            subscription.setStatus(status);
        } else {
            // Create new subscription
            subscription = new ProgramSubscription();
            subscription.setProgram(program);
            subscription.setOrganization(organization);
            subscription.setStartDate(OffsetDateTime.now());
            
            // Set end date based on program duration or a default period
            // Adjust according to your business logic
            OffsetDateTime endDate = OffsetDateTime.now().plus(365, ChronoUnit.DAYS); // Default to one year
            subscription.setEndDate(endDate);
            
            subscription.setTransactionId(paymentId);
            subscription.setTransactionType("RAZORPAY");
            subscription.setTransactionDate(OffsetDateTime.now());
            subscription.setAmountPaid(amount);
            subscription.setMaxCohorts(maxCohorts);
            subscription.setStatus(status);
            
            // Set user information
            subscription.setUserEmail(userEmail);
            subscription.setUserName(userName);
            subscription.setUserPhoneNumber(userPhone);
            subscription.setUserAddress(userAddress);
        }
        
        // Save the subscription
        subscriptionRepository.save(subscription);
        
        logger.info("Subscription created/updated: {}", subscription);
    }
    
    private String extractEmailFromPayment(JSONObject paymentEntity) {
        // Try to extract email from various possible locations in the payment entity
        
        // Check in notes
        if (paymentEntity.has("notes")) {
            JSONObject notes = paymentEntity.getJSONObject("notes");
            if (notes.has("email")) {
                return notes.getString("email");
            }
        }
        
        // Check in customer details if available
        if (paymentEntity.has("customer_details")) {
            JSONObject customerDetails = paymentEntity.getJSONObject("customer_details");
            if (customerDetails.has("email")) {
                return customerDetails.getString("email");
            }
        }
        
        // If using RazorpayX, check in contact
        if (paymentEntity.has("contact")) {
            JSONObject contact = paymentEntity.getJSONObject("contact");
            if (contact.has("email")) {
                return contact.getString("email");
            }
        }
        
        // If cannot find email, return null
        return null;
    }
}