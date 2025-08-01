package com.FlowofEnglish.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.*;
import org.slf4j.*;
import com.FlowofEnglish.service.*;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    private static final Logger logger = LoggerFactory.getLogger(SchedulerConfig.class);
    
    @Autowired
    private WeeklyReportService weeklyReportService;
        
//    @Scheduled(cron = "0 50 12 * * TUE", zone = "Asia/Kolkata") // Every Tuesday at 10 AM
    public void sendWeeklyEmails() {
        System.out.println("Weekly email scheduler triggered at: " + java.time.LocalDateTime.now());
        logger.info("Weekly email scheduler triggered at: {}", java.time.LocalDateTime.now());
        try {
            weeklyReportService.sendWeeklyReports();
            logger.info("Weekly email process completed successfully.");
        } catch (Exception e) {
            logger.error("Error occurred while sending weekly emails: {}", e.getMessage(), e);
        }
    }
}





//@Autowired
//private BuddhaPurnimaGreetingService buddhaPurnimaGreetingService;



//    // Run once at 2:00 PM  (May 12, 2025)
//    @Scheduled(cron = "0 0 14 12 5 ?", zone = "Asia/Kolkata")
//    public void sendBuddhaPurnimaGreetings() {
//        System.out.println("Buddha Purnima greeting scheduler triggered at: " + java.time.LocalDateTime.now());
//        logger.info("Buddha Purnima greeting scheduler triggered at: {}", java.time.LocalDateTime.now());
//        try {
//            buddhaPurnimaGreetingService.sendBuddhaPurnimaGreetings();
//            logger.info("Buddha Purnima greeting process completed successfully.");
//        } catch (Exception e) {
//            logger.error("Error occurred while sending Buddha Purnima greetings: {}", e.getMessage(), e);
//        }
//    }