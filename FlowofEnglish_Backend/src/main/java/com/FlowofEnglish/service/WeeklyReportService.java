package com.FlowofEnglish.service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.transaction.Transactional;

@Service
public class WeeklyReportService {
    @Autowired
    private UserSessionMappingRepository userSessionMappingRepository;
    
    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;
    
    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportService.class);

    @Transactional
    public List<User> getInactiveUsers(int inactivityDays) {
        OffsetDateTime cutoffTime = OffsetDateTime.now().minusDays(inactivityDays);

        // Fetch latest attempt timestamps for all users
        List<Object[]> latestAttempts = userAttemptsRepository.findLatestAttemptTimestamps();

        // Filter users inactive for the specified days
        List<User> inactiveUsers = latestAttempts.stream()
            .filter(attempt -> {
                OffsetDateTime lastAttempt = (OffsetDateTime) attempt[1];
                return lastAttempt.isBefore(cutoffTime);
            })
            .map(attempt -> userRepository.findById((String) attempt[0]).orElse(null))
            .filter(user -> user != null)
            .collect(Collectors.toList());

        return inactiveUsers;
    }
    @Transactional
    public void sendWeeklyReports() {
    	logger.info("Starting weekly email report process...");

        OffsetDateTime fiveDaysAgo = OffsetDateTime.now().minusDays(5);
     // Get inactive users from attempts instead of session mapping
        List<User> inactiveUsers = getInactiveUsers(5);
        logger.info("Fetched {} inactive users since {}", inactiveUsers.size(), fiveDaysAgo);

//        // Fetch all users inactive for more than 5 days
//        List<User> inactiveUsers = userSessionMappingRepository.findInactiveUsersSince(fiveDaysAgo);
//        logger.info("Fetched {} inactive users since {}", inactiveUsers.size(), fiveDaysAgo);

        // Separate users with valid emails
        List<User> usersWithEmails = inactiveUsers.stream()
            .filter(user -> user.getUserEmail() != null && !user.getUserEmail().isEmpty())
            .collect(Collectors.toList());
        logger.info("Found {} users with valid emails", usersWithEmails.size());

        // Group inactive users by organization and cohort
        Map<String, Map<String, List<User>>> orgCohortMap = inactiveUsers.stream()
            .collect(Collectors.groupingBy(
                user -> String.valueOf(user.getOrganization().getOrganizationId()),
                Collectors.groupingBy(user -> {
                    List<UserCohortMapping> mappings = user.getUserCohortMappings();
                    return mappings != null && !mappings.isEmpty() 
                           ? String.valueOf(mappings.get(0).getCohort().getCohortId())
                           : "Unknown";
                })
            ));

        // Process each organization
        orgCohortMap.forEach((orgId, cohortUsers) -> {
            cohortUsers.forEach((cohortId, users) -> {
            	try {
                // Find the top scorer in this cohort
                UserCohortMapping topper = users.stream()
                    .flatMap(user -> user.getUserCohortMappings().stream())
                    .filter(mapping -> cohortId.equals(String.valueOf(mapping.getCohort().getCohortId())))
                    .max(Comparator.comparingInt(UserCohortMapping::getLeaderboardScore))
                    .orElse(null);

                // Send report email to admin
                sendEmailToOrganizationAdmin(orgId, cohortId, users, topper);
                logger.info("Processed cohort {} in organization {}, sent {} admin emails.", cohortId, orgId, 1);


                // Send individual emails to users
                usersWithEmails.forEach(user ->{
                	try {
                sendInactiveUserEmail(user, topper);
                logger.info("Email sent successfully to user: {}", user.getUserEmail());
                    } catch (Exception e) {
                        logger.error("Failed to send email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
                    }
                });
            } catch (Exception e) {
                logger.error("Error processing cohort {} in organization {}. Error: {}", cohortId, orgId, e.getMessage(), e);
            }
        });
    });

    logger.info("Completed weekly email report process.");
}

    private void sendEmailToOrganizationAdmin(String orgId, String cohortId, List<User> inactiveUsers, UserCohortMapping topper) {
        if (inactiveUsers == null || inactiveUsers.isEmpty()) {
            return;
        }

        String subject = "Weekly Report for Cohort " + cohortId;
        String adminEmail = inactiveUsers.get(0).getOrganization().getOrganizationAdminEmail();

        StringBuilder emailBody = new StringBuilder()
            .append("Weekly Report for Cohort: ").append(cohortId).append("\n\n")
            .append("Inactive Users (more than 5 days):\n");

        inactiveUsers.forEach(user -> 
            emailBody.append("- ")
                    .append(user.getUserName())
                    .append(" (")
                    .append(user.getUserEmail() != null ? user.getUserEmail() : "No Email Provided")
                    .append(")\n")
        );

        if (topper != null) {
            emailBody.append("\nLeaderboard Topper:\n")
                    .append(topper.getUser().getUserName())
                    .append(" (Score: ")
                    .append(topper.getLeaderboardScore())
                    .append(")\n");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(adminEmail);
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);
    }

    private void sendInactiveUserEmail(User user, UserCohortMapping topper) {
        if (user.getUserEmail() == null || user.getUserEmail().isEmpty()) {
            return;
        }

//        String subject = "We've Missed You! 🥺 Time to Get Back in the Game! 🎉";
//        StringBuilder emailBody = new StringBuilder()
//            .append("Hello ").append(user.getUserName()).append(",\n\n")
//            .append("We’ve noticed you've been taking a little break from us since ")
//            .append("5 days ago").append(". It’s been 5 days without your amazing presence, ")
//            .append("and we’re starting to feel like our favorite TV show got canceled mid-season! 📺🥺\n\n")
//            .append("Your learning journey awaits, and we can’t wait to see you back in action. Think of all the new things you can discover, the skills you can master, and the fun you can have!\n\n")
//            .append("Click here to pick up where you left off and dive back into the world of learning: https://flowofenglish.thechippersage.com\n\n")
//            .append("Remember, every great adventure begins with a single step, and we’re here to make every step count!\n\n")
//            .append("Looking forward to seeing you soon.\n\n")
//            .append("Happy Learning!\n\n")
//            .append("Thank you,\nChippersage Team");
        String subject = "Missing Your Awesome Progress! 🌟 Ready to Continue Your Learning Journey? 💪";
        StringBuilder emailBody = new StringBuilder()
        .append("Hello ").append(user.getUserName()).append(",\n\n")
        .append("We've been thinking about you! Your unique perspective and enthusiasm always make our learning community brighter. ")
        .append("The journey of learning is more exciting when you're here with us! 🌈\n\n")
        .append("Did you know that consistent learning, even just 15 minutes a day, can lead to amazing breakthroughs? ")
        .append("Your potential is limitless, and we're here to support you every step of the way. 🚀\n\n")
        .append("Ready to jump back in? Your personalized learning path is waiting for you: https://flowofenglish.thechippersage.com\n\n")
        .append("Remember, every champion has faced pauses in their journey. What matters is coming back stronger! ")
        .append("We've got some exciting new content that we think you'll love. 💡\n\n")
        .append("Can't wait to see your next breakthrough!\n\n")
        .append("Cheering you on,\n")
        .append("The Chippersage Team")
        .append("\n\nP.S. We've saved your progress exactly where you left off - just one click and you're back on track! 🎯");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);
    }
}
