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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.transaction.Transactional;

@Service
public class WeeklyReportService {
    
    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;
    
    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportService.class);
    
    private static final String TEAM_ORG_ID = "TEAM";

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


             // Send individual emails to users based on their organization
                usersWithEmails.forEach(user -> {
                    try {
                        if (TEAM_ORG_ID.equals(user.getOrganization().getOrganizationId())) {
                            sendBoardExamUserEmail(user);
                        } else {
                            sendInactiveUserEmail(user, topper);
                        }
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
    
    private void sendBoardExamUserEmail(User user) {
        if (user.getUserEmail() == null || user.getUserEmail().isEmpty()) {
            return;
        }

        String subject = "Exam Duty Superhero! 🦸‍♀️ How's Your Secret Teacher Life Going?";
        StringBuilder emailBody = new StringBuilder()
            .append("Dear ").append(user.getUserName()).append(",\n\n")
            .append("Quick check-in on our favorite exam supervisor! Still rocking those silent footsteps in the exam hall? 🤫\n\n")
            .append("🏆 Your Superhero Stats This Week:\n")
            .append("• Hours spent giving 'the look': Countless 👀\n")
            .append("• Hidden cheat sheets spotted: Too many to count 🕵️\n")
            .append("• Coffee consumed: Probably not enough ☕\n\n")
            .append("Here's today's teacher joke to brighten your exam duty:\n")
            .append("What do you call a teacher who doesn't fart in public?\n")
            .append("A private tutor! 😂\n\n")
            .append("Your Flow of English progress is still safely paused, and we're keeping your spot warm. ")
            .append("Your virtual classroom sends its regards (it's been suspiciously quiet without you!).\n\n")
            .append("Quick Teacher Survival Tips:\n")
            .append("• Those confiscated phones make great paperweights\n")
            .append("• Blinking is optional, but recommended\n")
            .append("• Your 'I saw that' radar is probably at 200% capacity by now\n\n")
            .append("Got funny exam stories? We're all ears at support@thechippersage.com!\n\n")
            .append("Rooting for you,\n")
            .append("The Chippersage Team 🌟\n\n")
            .append("P.S. We'll be here when you're ready: https://flowofenglish.thechippersage.com");
        // Send to teacher
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);

        // Send copy to admin and support
        SimpleMailMessage adminCopy = new SimpleMailMessage();
        adminCopy.setTo(new String[]{
            user.getOrganization().getOrganizationAdminEmail(),
            "support@thechippersage.com"
        });
        adminCopy.setSubject("Teacher on Exam Duty - " + user.getUserName());
        adminCopy.setText(
            "Exam duty notification sent to:\n" +
            "Teacher: " + user.getUserName() + "\n" +
            "Email: " + user.getUserEmail() + "\n" +
            "Organization: " + user.getOrganization().getOrganizationId() + "\n" +
            "Status: On Board Exam Duty (Feb 21 - Mar 11)\n\n" +
            "Original email content:\n" +
            "------------------------\n" +
            emailBody.toString()
        );
        mailSender.send(adminCopy);
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
        
        String subject = "Missing Your English Adventures! 🚀 Your Learning Path is Getting Lonely!";
        
        StringBuilder emailBody = new StringBuilder()
            .append("Dear ").append(user.getUserName()).append(",\n\n")
            .append("**Guess what?** Your virtual English learning space has been sending us sad emojis! 😢 ")
            .append("It misses the sound of your clicks and the brilliance of your answers!\n\n")
            .append("## 🎬 What's Been Happening While You Were Away:\n")
            .append("Remember those challenging words you were mastering? They've been hanging out together, ")
            .append("planning a surprise quiz party for your return! (Don't worry - they're friendly quizzes with extra hints!)\n\n")
            .append("## 🔮 Fun Prediction:\n")
            .append("If you spend just 10 minutes today on Flow of English (yes, that's shorter than scrolling through ")
            .append("social media during breakfast!), your confidence meter will jump up by at least 17.5% ")
            .append("(our very scientific calculation)!\n\n")
            .append("🧠 Fun Fact:\n")
            .append("Did you know? Learners who return after a break often progress FASTER! ")
            .append("Your brain has been secretly processing everything behind the scenes.\n\n")
            .append("Ready to jump back in? → https://flowofenglish.thechippersage.com\n\n")
            .append("Need help? Questions? Just reply to this email or reach us at support@thechippersage.com\n\n")
            .append("Can't wait to see your progress!\n\n")
            .append("The Chippersage Team 🌟\n\n")
            .append("P.S. Just 10 minutes today will make tomorrow's English SO much easier! ✨");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);
    }
}
