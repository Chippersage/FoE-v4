package com.FlowofEnglish.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.FlowofEnglish.service.PaymentService;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
	
  @Autowired
  private PaymentService paymentService;
  
  @GetMapping("/createOrder")
  public String createOrder(@RequestParam double amount, @RequestParam String currency) {
    try {
      return paymentService.createOrder(amount, currency);
    } catch (Exception e) {
      return e.getMessage();
    }
  }
//  @PostMapping("/create-order")
//  public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> requestData) {
//      double amount = Double.parseDouble(requestData.get("amount").toString());
//      String currency = requestData.get("currency").toString();
//      try {
//          String orderResponse = paymentService.createOrder(amount, currency);
//          return ResponseEntity.ok(orderResponse);
//      } catch (Exception e) {
//          e.printStackTrace();
//          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating order");
//      }
//  }

  
  
  @PostMapping("/verify")
  public ResponseEntity<String> verifyPayment(@RequestParam String orderId,
                        @RequestParam String paymentId,
                        @RequestParam String razorpaySignature) {
    try {
      boolean isValid = paymentService.verifyPayment(orderId, paymentId, razorpaySignature);
      if (isValid) {
        return ResponseEntity.ok("Payment verified successfully");
      } else {
        return ResponseEntity.status(400).body("Payment verification failed");
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Error verifying payment");
    }
  }
}