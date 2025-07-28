package com.FlowofEnglish.service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.slf4j.*;
import jakarta.transaction.Transactional;

@Service
public class WeeklyReportService {
    
    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportService.class);
    private static final int DEFAULT_INACTIVITY_DAYS = 5;
    private static final String SUPPORT_EMAIL = "support@thechippersage.com";
    private static final String PLATFORM_URL = "https://flowofenglish.thechippersage.com";
    
    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public List<User> getInactiveUsers(int inactivityDays) {
        OffsetDateTime cutoffTime = OffsetDateTime.now().minusDays(inactivityDays);

        List<Object[]> latestAttempts = userAttemptsRepository.findLatestAttemptTimestamps();

        return latestAttempts.stream()
            .filter(attempt -> {
                OffsetDateTime lastAttempt = (OffsetDateTime) attempt[1];
                return lastAttempt.isBefore(cutoffTime);
            })
            .map(attempt -> userRepository.findById((String) attempt[0]).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void sendWeeklyReports() {
        logger.info("Starting weekly email report process...");

        try {
            List<User> inactiveUsers = getInactiveUsers(DEFAULT_INACTIVITY_DAYS);
            logger.info("Found {} inactive users", inactiveUsers.size());

            List<User> usersWithValidEmails = filterUsersWithValidEmails(inactiveUsers);
            logger.info("Found {} users with valid emails", usersWithValidEmails.size());

            sendAdminReports(inactiveUsers);
            sendUserNotifications(usersWithValidEmails);
            
            logger.info("Completed weekly email report process. Processed {} users.", usersWithValidEmails.size());
            
        } catch (Exception e) {
            logger.error("Error in weekly report process: {}", e.getMessage(), e);
        }
    }
    
    private List<User> filterUsersWithValidEmails(List<User> users) {
        return users.stream()
            .filter(user -> isValidEmail(user.getUserEmail()))
            .collect(Collectors.toList());
    }
    
    private boolean isValidEmail(String email) {
        return email != null && !email.trim().isEmpty();
    }
    
    private void sendAdminReports(List<User> inactiveUsers) {
        Map<String, Map<String, List<User>>> orgCohortMap = groupUsersByOrgAndCohort(inactiveUsers);
        
        orgCohortMap.forEach((orgId, cohortUsers) -> {
            cohortUsers.forEach((cohortId, users) -> {
                try {
                    UserCohortMapping topper = findTopScorer(users, cohortId);
                    sendAdminReport(orgId, cohortId, users, topper);
                    logger.info("Sent admin report for organization: {}, cohort: {}", orgId, cohortId);
                } catch (Exception e) {
                    logger.error("Failed to send admin report for org: {}, cohort: {}. Error: {}", 
                               orgId, cohortId, e.getMessage(), e);
                }
            });
        });
    }
    
    private Map<String, Map<String, List<User>>> groupUsersByOrgAndCohort(List<User> users) {
        return users.stream()
            .collect(Collectors.groupingBy(
                user -> String.valueOf(user.getOrganization().getOrganizationId()),
                Collectors.groupingBy(this::getCohortId)
            ));
    }
    
    private String getCohortId(User user) {
        List<UserCohortMapping> mappings = user.getUserCohortMappings();
        return mappings != null && !mappings.isEmpty() 
               ? String.valueOf(mappings.get(0).getCohort().getCohortId())
               : "Unknown";
    }
    
    private UserCohortMapping findTopScorer(List<User> users, String cohortId) {
        return users.stream()
            .flatMap(user -> user.getUserCohortMappings().stream())
            .filter(mapping -> cohortId.equals(String.valueOf(mapping.getCohort().getCohortId())))
            .max(Comparator.comparingInt(UserCohortMapping::getLeaderboardScore))
            .orElse(null);
    }
    
    private void sendUserNotifications(List<User> users) {
        // Use a Set to track (email + name) pairs
        Set<String> processedKeys = new HashSet<>();

        for (User user : users) {
            String email = user.getUserEmail();
            String name = user.getUserName();

            if (!isValidEmail(email)) {
                logger.warn("Skipping user {} due to invalid email", user.getUserId());
                continue;
            }

            // Create a unique key for (email + name)
            String uniqueKey = email.trim().toLowerCase() + "::" + name.trim().toLowerCase();

            if (processedKeys.contains(uniqueKey)) {
                logger.debug("Duplicate found: Skipping email to {} ({})", name, email);
                continue;
            }

            try {
                sendInactiveUserNotification(user);
                processedKeys.add(uniqueKey); // mark as processed
                logger.info("Notification sent to user: {} ({})", name, email);
            } catch (Exception e) {
                logger.error("Failed to send notification to user: {} ({}) - Error: {}", name, email, e.getMessage(), e);
            }
        }
    }


    private void sendAdminReport(String orgId, String cohortId, List<User> inactiveUsers, UserCohortMapping topper) {
        if (inactiveUsers.isEmpty()) {
            return;
        }

        String adminEmail = inactiveUsers.get(0).getOrganization().getOrganizationAdminEmail();
        if (!isValidEmail(adminEmail)) {
            logger.warn("Invalid admin email for organization: {}", orgId);
            return;
        }

        String subject = String.format("Weekly Report - Cohort %s (Organization %s)", cohortId, orgId);
        String emailBody = buildAdminReportBody(cohortId, inactiveUsers, topper);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(adminEmail);
        message.setSubject(subject);
        message.setText(emailBody);
        
        mailSender.send(message);
    }
    
    private String buildAdminReportBody(String cohortId, List<User> inactiveUsers, UserCohortMapping topper) {
        StringBuilder body = new StringBuilder();
        body.append("Weekly Inactive Users Report\n");
        body.append("=".repeat(30)).append("\n\n");
        body.append("Cohort: ").append(cohortId).append("\n");
        body.append("Report Date: ").append(OffsetDateTime.now().toLocalDate()).append("\n");
        body.append("Inactive Period: More than ").append(DEFAULT_INACTIVITY_DAYS).append(" days\n\n");
        
        body.append("Inactive Users (").append(inactiveUsers.size()).append("):\n");
        body.append("-".repeat(20)).append("\n");
        
        inactiveUsers.forEach(user -> {
            body.append("• ").append(user.getUserName());
            if (isValidEmail(user.getUserEmail())) {
                body.append(" (").append(user.getUserEmail()).append(")");
            } else {
                body.append(" (No email provided)");
            }
            body.append("\n");
        });

        if (topper != null) {
            body.append("\nCohort Leader:\n");
            body.append("-".repeat(15)).append("\n");
            body.append("• ").append(topper.getUser().getUserName());
            body.append(" - Score: ").append(topper.getLeaderboardScore()).append("\n");
        }
        
        body.append("\n---\n");
        body.append("ChipperSage Team\n");
        body.append("Support: ").append(SUPPORT_EMAIL);
        
        return body.toString();
    }

    private void sendInactiveUserNotification(User user) {
        if (!isValidEmail(user.getUserEmail())) {
            logger.warn("Invalid email for user: {}", user.getUserId());
            return;
        }
        
        String subject = "We Miss You! Your English Journey Awaits";
        String emailBody = buildUserNotificationBody(user);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody);
        
        mailSender.send(message);
    }
    
    private String buildUserNotificationBody(User user) {
        StringBuilder body = new StringBuilder();

        body.append("Hi ").append(user.getUserName()).append(",\n\n");

        body.append("We noticed you haven’t dropped by *Flow of English* lately, and we just wanted to check in.\n\n");
        
        body.append("Your English learning journey is still right where you left it:\n");
        body.append("• All your progress is safe and ready to pick up\n");
        body.append("• Fresh challenges and new lessons are waiting\n");
        body.append("• Your personalized learning path is just a click away\n\n");

        body.append("Even 10 minutes today can make a big difference! You’ll be surprised how quickly it all comes back once you get going.\n\n");

        body.append("Click here to jump back in: ").append(PLATFORM_URL).append("\n\n");

        body.append("Need help or have a question? Just reply to this email or drop us a note at ").append(SUPPORT_EMAIL).append("\n\n");

        body.append("We’re cheering you on, always!\n\n");
        body.append("Warm regards,\n");
        body.append("The ChipperSage Team\n\n");

        body.append("P.S. Learning a little every day adds up. You've got this 💪");

        return body.toString();
    }
}