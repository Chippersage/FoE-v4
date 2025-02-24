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

        String subject = "To Our Super Teacher! 🌟 Taking a Break While Making Future Leaders? We Get It! 😊";
        StringBuilder emailBody = new StringBuilder()
            .append("Dear ").append(user.getUserName()).append(",\n\n")
            .append("We heard you're in the midst of Uttarakhand Board exam duties (Feb 21 - Mar 11)! ")
            .append("Bet you're giving your best 'stern exam supervisor' look right now, aren't you? 😄\n\n")
            .append("🎭 Your Current Roles:\n")
            .append("• Exam Supervisor Extraordinaire 👮‍♂️\n")
            .append("• Answer Sheet Guardian 📝\n")
            .append("• Silent Footstep Master in the Exam Hall 🤫\n")
            .append("• Professional 'No Mobile Phones' Reminder 📱❌\n")
            .append("• Expert at Spotting Hidden Cheat Sheets 🔍 (We know you have superpowers!)\n\n")
            .append("We totally understand that you're busy ensuring fair exams - probably getting more steps on your pedometer ")
            .append("walking up and down those exam halls than a fitness instructor! 🚶‍♂️💨\n\n")
            .append("👩‍🏫 Message for Your Students:\n")
            .append("Please tell them the Chippersage Team is sending tons of good wishes! ")
            .append("We hope they're writing answers as brilliant as their smiles. No pressure, but we're expecting future ")
            .append("Einstein-level stuff! 🧠✨\n\n")
            .append("🎯 Quick Reminders (because we know you're pro at giving these!):\n")
            .append("• Your Flow of English progress is safely paused (no exam anxiety here!)\n")
            .append("• We're keeping your learning streak warm and cozy\n")
            .append("• Your virtual classroom is missing its favorite teacher\n\n")
            .append("Need a laugh during your exam duty breaks? Here's a teacher joke:\n")
            .append("Why did the teacher wear sunglasses in the exam hall?\n")
            .append("Because their students were so bright! ✨😎\n\n")
            .append("Remember:\n")
            .append("• Stay hydrated (coffee counts, we won't judge! ☕)\n")
            .append("• Take mini-breaks (yes, you're allowed!)\n")
            .append("• Keep that awesome smile (it scares away exam stress!)\n\n")
            .append("Got exam duty stories or just need to share a laugh?\n")
            .append("Drop us a line at support@thechippersage.com - we love teacher tales! 📬\n\n")
            .append("Cheering for you and your students,\n")
            .append("The Chippersage Team 🌟\n\n")
            .append("P.S. When the exam marathon is over and you're ready to return to your own learning journey, ")
            .append("we'll be waiting at https://flowofenglish.thechippersage.com\n\n")
            .append("P.P.S. You're doing an amazing job! And yes, we saw that yawn - maybe time for another coffee? ☕😄");

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
        String subject = "Hey " + user.getUserName() + "! 🌟 Your English Learning Adventure Misses You! 😊";
        StringBuilder emailBody = new StringBuilder()
            .append("Hello ").append(user.getUserName()).append("! 👋\n\n")
            .append("We noticed you haven't been practicing lately, and guess what? We really miss your presence! ")
            .append("Your smile and enthusiasm make our learning community special. 😊\n\n")
            .append("🌈 Quick Updates:\n")
            .append("• Your progress is safely saved\n")
            .append("• New fun activities are waiting for you\n")
            .append("• Your learning streak is ready to be continued\n\n")
            .append("💡 Did You Know?\n")
            .append("Just 15 minutes of daily practice (that's shorter than a TV commercial break!) ")
            .append("can boost your English skills significantly. And the best part? ")
            .append("You can do it while having fun! 🎮\n\n")
            .append("🎯 Ready to Jump Back In?\n")
            .append("→ Visit: https://flowofenglish.thechippersage.com\n")
            .append("→ Login with your usual details\n")
            .append("→ Pick up right where you left off!\n\n")
            .append("👋 Need Help or Have Ideas?\n")
            .append("• Technical issues? We're here to help!\n")
            .append("• Have suggestions? We'd love to hear them!\n")
            .append("• Just want to chat? That's cool too!\n\n")
            .append("Contact us anytime:\n")
            .append("📧 Email: support@thechippersage.com\n")
            .append("Or reply to this email - we read every message! 📬\n\n")
            .append("Remember: Learning English is like collecting smiles - ")
            .append("the more you practice, the bigger your collection grows! 😊\n\n")
            .append("Can't wait to see you back in action!\n\n")
            .append("Keep smiling and learning,\n")
            .append("The Chippersage Team 🌟\n\n")
            .append("P.S. Want to know a secret? Your brain does a little happy dance 🕺💃 every time you learn something new!");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);
    }
}
