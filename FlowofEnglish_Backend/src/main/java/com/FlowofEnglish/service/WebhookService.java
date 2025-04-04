package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.ProgramSubscription;
import com.FlowofEnglish.repository.OrganizationRepository;
import com.FlowofEnglish.repository.ProgramRepository;
import com.FlowofEnglish.repository.ProgramSubscriptionRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class WebhookService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);
    
    @Autowired
    private ProgramSubscriptionRepository subscriptionRepository;
    
    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
//    @Autowired
//    private EmailService emailService;
    
    @Transactional
    public void processWebhookEvent(String eventType, JSONObject payload) {
        logger.info("Processing event type: {}", eventType);
        
        try {
            JSONObject paymentEntity = null;
            JSONObject orderEntity = null;
            
            // Extract the entities based on event type
            switch (eventType) {
                case "payment.authorized":
                case "payment.captured":
                case "payment.failed":
                    paymentEntity = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                    break;
                case "order.paid":
                    orderEntity = payload.getJSONObject("payload").getJSONObject("order").getJSONObject("entity");
                    paymentEntity = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                    break;
                default:
                    logger.info("Unhandled event type: {}", eventType);
                    return;
            }
            
            // Process different event types
            switch (eventType) {
                case "payment.authorized":
                    handlePaymentAuthorized(paymentEntity);
                    break;
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
    
    private void handlePaymentAuthorized(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.getString("order_id");
        float amount = paymentEntity.getFloat("amount") / 100; // Convert from paise to rupees
        
        logger.info("Payment authorized: Payment ID={}, Order ID={}, Amount={}", paymentId, orderId, amount);
        
        // Send email notification
        Map<String, Object> emailParams = new HashMap<>();
        emailParams.put("paymentId", paymentId);
        emailParams.put("amount", amount);
        emailParams.put("status", "authorized");
        
        // You would need to extract customer email from your records or payment notes
        String notes = paymentEntity.has("notes") ? paymentEntity.getJSONObject("notes").toString() : "{}";
        logger.info("Payment notes: {}", notes);
        
        // This is a placeholder - in real implementation you'd need to determine the email
//        String email = extractEmailFromPayment(paymentEntity);
        
//        if (email != null) {
//            emailService.sendPaymentStatusEmail(email, "Payment Authorized", emailParams);
//        }
    }
    
    private void handlePaymentCaptured(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.getString("order_id");
        float amount = paymentEntity.getFloat("amount") / 100; // Convert from paise to rupees
        
        logger.info("Payment captured: Payment ID={}, Order ID={}, Amount={}", paymentId, orderId, amount);
        
        // Create or update subscription
        try {
            createOrUpdateSubscription(paymentEntity);
        } catch (Exception e) {
            logger.error("Error creating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification
        Map<String, Object> emailParams = new HashMap<>();
        emailParams.put("paymentId", paymentId);
        emailParams.put("amount", amount);
        emailParams.put("status", "successful");
        
   //     String email = extractEmailFromPayment(paymentEntity);
        
//        if (email != null) {
//            emailService.sendPaymentStatusEmail(email, "Payment Successful", emailParams);
//        }
    }
    
    private void handlePaymentFailed(JSONObject paymentEntity) {
        String paymentId = paymentEntity.getString("id");
        String orderId = paymentEntity.getString("order_id");
        float amount = paymentEntity.getFloat("amount") / 100; // Convert from paise to rupees
        String errorCode = paymentEntity.has("error_code") ? paymentEntity.getString("error_code") : "unknown";
        String errorDescription = paymentEntity.has("error_description") ? paymentEntity.getString("error_description") : "Unknown error";
        
        logger.info("Payment failed: Payment ID={}, Order ID={}, Amount={}, Error={}", paymentId, orderId, amount, errorCode);
        
        // Send email notification
        Map<String, Object> emailParams = new HashMap<>();
        emailParams.put("paymentId", paymentId);
        emailParams.put("amount", amount);
        emailParams.put("status", "failed");
        emailParams.put("reason", errorDescription);
        
      //  String email = extractEmailFromPayment(paymentEntity);
        
//        if (email != null) {
//            emailService.sendPaymentStatusEmail(email, "Payment Failed", emailParams);
//        }
    }
    
    private void handleOrderPaid(JSONObject orderEntity, JSONObject paymentEntity) {
        String orderId = orderEntity.getString("id");
        float amount = orderEntity.getFloat("amount") / 100; // Convert from paise to rupees
        
        logger.info("Order paid: Order ID={}, Amount={}", orderId, amount);
        
        // Similar processing as payment captured
        try {
            createOrUpdateSubscription(paymentEntity);
        } catch (Exception e) {
            logger.error("Error creating subscription: {}", e.getMessage(), e);
        }
        
        // Send email notification
        Map<String, Object> emailParams = new HashMap<>();
        emailParams.put("orderId", orderId);
        emailParams.put("amount", amount);
        emailParams.put("status", "paid");
        
    //    String email = extractEmailFromPayment(paymentEntity);
        
//        if (email != null) {
//            emailService.sendPaymentStatusEmail(email, "Order Paid Successfully", emailParams);
//        }
    }
    
    @Transactional
    private void createOrUpdateSubscription(JSONObject paymentEntity) {
        // Extract the necessary data from the payment entity
        String paymentId = paymentEntity.getString("id");
        float amount = paymentEntity.getFloat("amount") / 100; // Convert from paise to rupees
        
        // Extract program and organization IDs from notes (you may need to adjust this based on your implementation)
        JSONObject notes = paymentEntity.has("notes") ? paymentEntity.getJSONObject("notes") : new JSONObject();
        
        if (!notes.has("program_id") || !notes.has("organization_id")) {
            logger.error("Missing program_id or organization_id in payment notes");
            return;
        }
        
        String programId = notes.getString("program_id");
        String organizationId = notes.getString("organization_id");
        Integer maxCohorts = notes.has("max_cohorts") ? notes.getInt("max_cohorts") : 1;
        
        // Fetch program and organization
        Optional<Program> programOpt = programRepository.findByProgramId(programId);
        Optional<Organization> orgOpt = organizationRepository.findById(organizationId);
        
        if (!programOpt.isPresent() || !orgOpt.isPresent()) {
            logger.error("Program or Organization not found. Program ID: {}, Org ID: {}", programId, organizationId);
            return;
        }
        
        Program program = programOpt.get();
        Organization organization = orgOpt.get();
        
        // Create subscription
        ProgramSubscription subscription = new ProgramSubscription();
        subscription.setProgram(program);
        subscription.setOrganization(organization);
        subscription.setStartDate(OffsetDateTime.now());
        
        // Set end date based on program duration (assuming you have a duration field in Program, or use a fixed period)
        // This is just an example, adjust according to your business logic
        OffsetDateTime endDate = OffsetDateTime.now().plus(365, ChronoUnit.DAYS); // Default to one year
        subscription.setEndDate(endDate);
        
        subscription.setTransactionId(paymentId);
        subscription.setTransactionType("RAZORPAY");
        subscription.setTransactionDate(OffsetDateTime.now());
        subscription.setAmountPaid(amount);
        subscription.setMaxCohorts(maxCohorts);
        
        // Save the subscription
        subscriptionRepository.save(subscription);
        
        logger.info("Subscription created: {}", subscription);
    }
    
//    private String extractEmailFromPayment(JSONObject paymentEntity) {
//        // Try to extract email from payment entity
//        // This is highly dependent on your implementation
//        // You might store it in notes, or you might need to look up the user based on other information
//        
//        if (paymentEntity.has("notes") && paymentEntity.getJSONObject("notes").has("email")) {
//            return paymentEntity.getJSONObject("notes").getString("email");
//        }
        
        // If you have a contact field
//        if (paymentEntity.has("contact") && !paymentEntity.getString("contact").isEmpty()) {
//            String contact = paymentEntity.getString("contact");
//            // Look up user by contact in your database and return email
//            // This is just a placeholder
//        }
        
        // If you have a customer_id field
//        if (paymentEntity.has("customer_id") && !paymentEntity.getString("customer_id").isEmpty()) {
//            String customerId = paymentEntity.getString("customer_id");
//            // Look up user by customerId in your database and return email
//        }
//        
//        logger.warn("Could not extract email from payment entity");
//        return null;
//    }
}