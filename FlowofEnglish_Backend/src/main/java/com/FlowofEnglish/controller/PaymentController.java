package com.FlowofEnglish.controller;

import com.FlowofEnglish.service.PaymentService;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/createOrder")
    public ResponseEntity<?> createOrder(
        @RequestParam(required = true) double amount,
        @RequestParam(required = true) String currency) {
        try {
            String orderResponse = paymentService.createOrder(amount, currency, new HashMap<>());
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating order: " + e.getMessage());
        }
    }
    
    @PostMapping("/createSubscriptionOrder")
    public ResponseEntity<?> createSubscriptionOrder(
        @RequestParam(required = true) double amount,
        @RequestParam(required = true) String currency,
        @RequestParam(required = true) String programId,
        @RequestParam(required = true) String organizationId,
        @RequestParam(required = false, defaultValue = "1") Integer maxCohorts,
        @RequestParam(required = false) String userName,
        @RequestParam(required = false) String userEmail,
        @RequestParam(required = false) String userPhone,
        @RequestParam(required = false) String userAddress) {
        
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("program_id", programId);
            metadata.put("organization_id", organizationId);
            metadata.put("max_cohorts", maxCohorts);
            
            if (userName != null) metadata.put("name", userName);
            if (userEmail != null) metadata.put("email", userEmail);
            if (userPhone != null) metadata.put("contact", userPhone);
            if (userAddress != null) metadata.put("address", userAddress);
            
            String orderResponse = paymentService.createOrder(amount, currency, metadata);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating subscription order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
        @RequestParam String orderId,
        @RequestParam String paymentId,
        @RequestParam String razorpaySignature) {
        try {
            boolean isValid = paymentService.verifyPayment(orderId, paymentId, razorpaySignature);
            if (isValid) {
                return ResponseEntity.ok("Payment verified successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Payment verification failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error verifying payment: " + e.getMessage());
        }
    }
    
    @GetMapping("/subscription/status/{subscriptionId}")
    public ResponseEntity<?> getSubscriptionStatus(@PathVariable Long subscriptionId) {
        try {
            return ResponseEntity.ok(paymentService.getSubscriptionStatus(subscriptionId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving subscription status: " + e.getMessage());
        }
    }
}