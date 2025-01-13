package com.FlowofEnglish.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.FlowofEnglish.service.WeeklyReportService;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Autowired
    private WeeklyReportService weeklyReportService;

    @Scheduled(cron = "0 0 9 * * MON") // Every Monday at 9 AM
    public void sendWeeklyEmails() {
        weeklyReportService.sendWeeklyReports();
    }
}
