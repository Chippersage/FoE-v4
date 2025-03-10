package com.FlowofEnglish.service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.transaction.Transactional;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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
    
    // Define image paths as constants - using class-path for deployed environment
    private static final String CONSISTENCY_IMAGE = "images/Improve Everyday 01.jpg";
    private static final String LOGO_IMAGE = "images/ChipperSageLogo.png";

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

        // Create a set to track users who have already received emails
        Set<String> processedUserIds = new HashSet<>();

        // Group inactive users by organization and cohort for admin reports only
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

        // Process each organization for admin reports only
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
                } catch (Exception e) {
                    logger.error("Error processing cohort {} in organization {}. Error: {}", cohortId, orgId, e.getMessage(), e);
                }
            });
        });

        // Handle individual user emails separately to prevent duplicates
        for (User user : usersWithEmails) {
            // Skip if user already received an email
            if (processedUserIds.contains(user.getUserId())) {
                logger.info("Skipping duplicate email for user: {}", user.getUserId());
                continue;
            }

            try {
                // Find the user's top cohort score for motivation (if applicable)
                UserCohortMapping userTopperInfo = user.getUserCohortMappings().stream()
                    .max(Comparator.comparingInt(UserCohortMapping::getLeaderboardScore))
                    .orElse(null);

                if (TEAM_ORG_ID.equals(user.getOrganization().getOrganizationId())) {
                    sendBoardExamUserEmail(user);
                } else {
                    sendInactiveUserEmail(user, userTopperInfo);
                }
                
                // Mark this user as processed
                processedUserIds.add(user.getUserId());
                logger.info("Email sent successfully to user: {}", user.getUserEmail());
            } catch (Exception e) {
                logger.error("Failed to send email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
            }
        }
        
        logger.info("Completed weekly email report process. Sent emails to {} unique users.", processedUserIds.size());
    }
    
    private void sendBoardExamUserEmail(User user) {
        if (user.getUserEmail() == null || user.getUserEmail().isEmpty()) {
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getUserEmail());
            helper.setSubject("Your English Journey Misses You! 🚀 Time to Reignite the Fun!");
            
            StringBuilder emailBody = new StringBuilder()
                .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
                .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
                .append("<p>Dear ").append(user.getUserName()).append(",</p>")
             // Engaging message
                .append("<p>Your virtual English learning space has been awfully quiet without you! 😢 ")
                .append("It's been waiting for your clicks, your progress, and those 'aha!' moments.</p>")
             // Section: What's Happening While You Were Away
                .append("<h3 style='color: #4a86e8;'>Here's What's Happening While You Were Away:</h3>")
                .append("<ul>")
                .append("<li>📖 The words you were mastering? They’ve been whispering, “Where’s ").append(user.getUserName()).append("?”</li>")
                .append("<li>🎉 Your quizzes have been warming up for your grand return!</li>")
                .append("<li>🧩 Your progress path is waiting for its next victory moment!</li>")
                .append("</ul>")
             // Insert consistency image
                .append("<div style='text-align: center; margin: 20px 0;'>")
                .append("<img src='cid:consistencyImage' alt='Consistency' style='max-width: 100%; height: auto;'/>")
                .append("</div>")
                
             // Section: Just 10 Minutes Can Make a Difference
                .append("<h3 style='color: #4a86e8;'>Just 10 Minutes Can Make a Difference!</h3>")
                .append("<p>🔮 <b>Fun Prediction:</b> A quick 10-minute session today can boost your confidence by 17.5%! (Yes, we did the math. 😉)</p>")
                
                // Fun Fact
                .append("<h3 style='color: #4a86e8;'>🧠 Did You Know?</h3>")
                .append("<p>Taking a break is actually good! Your brain has been processing your last lessons in the background—now it's time to level up even faster! 🚀</p>")

                // CTA Button
                .append("<div style='text-align: center; margin: 20px 0;'>")
                .append("<a href='https://flowofenglish.thechippersage.com' ")
                .append("style='display: inline-block; padding: 12px 20px; background-color: #4a86e8; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;'>")
                .append("👉 Jump Back In Now!</a>")
                .append("</div>")

                // Support Information
                .append("<p>💡 <b>Need help?</b> Questions? Just reply to this email or reach us at ")
                .append("<a href='mailto:support@thechippersage.com'>support@thechippersage.com</a>.</p>")
                
                // Sign-off
                .append("<p>We can't wait to celebrate your progress! 🚀</p>")
                .append("<p><b>The Chippersage Team 🌟</b></p>")

                // P.S. Message
                .append("<p><i>P.S. A tiny 10-minute effort today will make tomorrow's English feel like a breeze! ✨</i></p>")

             // Footer with Logo
                .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
                .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
                .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
                .append("</div>")

                .append("</div></body></html>");


            helper.setText(emailBody.toString(), true);
            
            // Add images as inline attachments
            helper.addInline("consistencyImage", new ClassPathResource(CONSISTENCY_IMAGE));
            helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
            
            mailSender.send(mimeMessage);
            
            // Send copy to admin and support using simple text for admin copy
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
                "Original email content sent in HTML format with images."
            );
            mailSender.send(adminCopy);
            
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
            // Fallback to plain text email
            sendPlainTextFallbackEmail(user, "Exam Duty Superhero!");
        }
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
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getUserEmail());
            helper.setSubject("Missing Your English Adventures! 🚀 Your Learning Path is Getting Lonely!");
            
            StringBuilder emailBody = new StringBuilder()
                .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
                .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
                .append("<p>Dear ").append(user.getUserName()).append(",</p>")
                .append("<p><strong>Guess what?</strong> Your virtual English learning space has been sending us sad emojis! 😢 ")
                .append("It misses the sound of your clicks and the brilliance of your answers!</p>")
                .append("<h2 style='color: #4a86e8;'>🎬 What's Been Happening While You Were Away:</h2>")
                .append("<p>Remember those challenging words you were mastering? They've been hanging out together, ")
                .append("planning a surprise quiz party for your return! (Don't worry - they're friendly quizzes with extra hints!)</p>")
                
                // Insert consistency image
                .append("<div style='text-align: center; margin: 20px 0;'>")
                .append("<img src='cid:consistencyImage' alt='Improve Every Day' style='max-width: 100%; height: auto;'/>")
                .append("</div>")
                
                .append("<h2 style='color: #4a86e8;'>🔮 Fun Prediction:</h2>")
                .append("<p>If you spend just 10 minutes today on Flow of English (yes, that's shorter than scrolling through ")
                .append("social media during breakfast!), your confidence meter will jump up by at least 17.5% ")
                .append("(our very scientific calculation)!</p>")
                .append("<p><strong>🧠 Fun Fact:</strong></p>")
                .append("<p>Did you know? Learners who return after a break often progress FASTER! ")
                .append("Your brain has been secretly processing everything behind the scenes.</p>")
                .append("<p><a href='https://flowofenglish.thechippersage.com' style='display: inline-block; background-color: #4a86e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;'>Ready to jump back in? →</a></p>")
                .append("<p>Need help? Questions? Just reply to this email or reach us at <a href='mailto:support@thechippersage.com'>support@thechippersage.com</a></p>")
                .append("<p>Can't wait to see your progress!</p>")
                .append("<p>The Chippersage Team 🌟</p>")
                .append("<p><i>P.S. Just 10 minutes today will make tomorrow's English SO much easier! ✨</i></p>")
                
                // Footer with logo
                .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
                .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
                .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
                .append("</div>")
                
                .append("</div></body></html>");

            helper.setText(emailBody.toString(), true);
            
            // Add images as inline attachments
            helper.addInline("consistencyImage", new ClassPathResource(CONSISTENCY_IMAGE));
            helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
            
            mailSender.send(mimeMessage);
            
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
            // Fallback to plain text email
            sendPlainTextFallbackEmail(user, "Missing Your English Adventures!");
        }
    }
    
    // Fallback method to send plain text emails if HTML email fails
    private void sendPlainTextFallbackEmail(User user, String subject) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getUserEmail());
            message.setSubject(subject);
            
            StringBuilder emailBody = new StringBuilder()
                .append("Dear ").append(user.getUserName()).append(",\n\n")
                .append("We've been missing you at Flow of English! Your learning journey is waiting for you.\n\n")
                .append("Ready to jump back in? → https://flowofenglish.thechippersage.com\n\n")
                .append("Need help? Questions? Just reply to this email or reach us at support@thechippersage.com\n\n")
                .append("The Chippersage Team");
            
            message.setText(emailBody.toString());
            mailSender.send(message);
            
            logger.info("Fallback plain text email sent to user: {}", user.getUserEmail());
        } catch (Exception e) {
            logger.error("Failed to send even fallback email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
        }
    }
}