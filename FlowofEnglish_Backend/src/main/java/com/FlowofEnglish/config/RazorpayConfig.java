package com.FlowofEnglish.config;
import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class RazorpayConfig {
	
  @Value("${razorpay.keyId}")
  private String keyId;
  
  @Value("${razorpay.keySecret}")
  private String keySecret;
  
  @Bean
  public RazorpayClient razorpayClient() throws Exception {
    return new RazorpayClient(keyId, keySecret);
  }
    public String getSecret() {
        return keySecret;
      }
}
//Add the API keys in your application.properties file:
//razorpay.keyId=YOUR_KEY_ID
//razorpay.keySecret=YOUR_KEY_SECRET