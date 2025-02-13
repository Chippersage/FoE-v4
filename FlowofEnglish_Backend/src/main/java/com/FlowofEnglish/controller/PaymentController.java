package com.FlowofEnglish.controller;

import com.FlowofEnglish.service.PaymentService;
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
            String orderResponse = paymentService.createOrder(amount, currency);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating order: " + e.getMessage());
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
}