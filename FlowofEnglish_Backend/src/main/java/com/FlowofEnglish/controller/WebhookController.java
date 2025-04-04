package com.FlowofEnglish.controller;

import com.FlowofEnglish.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
//import java.util.Enumeration;
//import java.util.HashMap;
//import java.util.Map;

import org.apache.commons.codec.binary.Hex;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/webhook")
public class WebhookController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);
    
    @Autowired
    private WebhookService webhookService;
    
    @Value("${razorpay.webhookSecret}")
    private String webhookSecret;
    
    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        
        logger.info("Received Razorpay webhook");
        
        try {
            // Verify webhook signature
            if (!verifySignature(payload, signature)) {
                logger.error("Webhook signature verification failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
            }
            
            // Process the webhook event
            JSONObject payloadJson = new JSONObject(payload);
            String eventType = payloadJson.getString("event");
            
            logger.info("Processing webhook event: {}", eventType);
            
            webhookService.processWebhookEvent(eventType, payloadJson);
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing webhook: " + e.getMessage());
        }
    }
    
    private boolean verifySignature(String payload, String signature) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secretKey);
            String computedSignature = Hex.encodeHexString(sha256_HMAC.doFinal(payload.getBytes()));
            
            return signature.equals(computedSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }
}