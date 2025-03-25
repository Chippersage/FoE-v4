package com.FlowofEnglish.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.FlowofEnglish.service.*;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    private static final Logger logger = LoggerFactory.getLogger(SchedulerConfig.class);
    
    @Autowired
    private WeeklyReportService weeklyReportService;
    
//    @Autowired
//    private HoliGreetingService holiGreetingService;
    
    @Scheduled(cron = "0 0 9 * * MON", zone = "Asia/Kolkata") // Every Monday at 9 AM
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
    
//    // Run once at 3:45 PM today (March 14, 2025)
//    @Scheduled(cron = "0 0 16 14 3 ?", zone = "Asia/Kolkata")
//    public void sendHoliGreetings() {
//        System.out.println("Holi greeting scheduler triggered at: " + java.time.LocalDateTime.now());
//        logger.info("Holi greeting scheduler triggered at: {}", java.time.LocalDateTime.now());
//        try {
//            holiGreetingService.sendHoliGreetings();
//            logger.info("Holi greeting process completed successfully.");
//        } catch (Exception e) {
//            logger.error("Error occurred while sending Holi greetings: {}", e.getMessage(), e);
//        }
//    }
}