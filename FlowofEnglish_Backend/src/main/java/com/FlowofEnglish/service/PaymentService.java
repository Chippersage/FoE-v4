package com.FlowofEnglish.service;

import com.FlowofEnglish.config.RazorpayConfig;
import com.FlowofEnglish.util.Utils;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
	
  @Autowired
  private RazorpayClient razorpayClient;
  
  @Autowired
  private RazorpayConfig razorpayConfig;
  
  
  public String createOrder(double amount, String currency) throws RazorpayException {
	  try {
          JSONObject orderRequest = new JSONObject();
          orderRequest.put("amount", (int)(amount * 100)); // Convert to paise and ensure it's an integer
          orderRequest.put("currency", currency);
          orderRequest.put("payment_capture", 1);
          
          Order order = razorpayClient.Orders.create(orderRequest);
          return order.toString();
      } catch (RazorpayException e) {
          throw new RazorpayException("Error creating order: " + e.getMessage());
      }
  }
  
  public boolean verifyPayment(String orderId, String paymentId, String razorpaySignature) {
	  try {
          String payload = orderId + "|" + paymentId;
          return Utils.verifySignature(payload, razorpaySignature, razorpayConfig.getSecret());
      } catch (Exception e) {
          e.printStackTrace();
          return false;
      }
  }
}