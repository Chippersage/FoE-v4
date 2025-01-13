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
import com.FlowofEnglish.repository.UserRepository;
import com.FlowofEnglish.repository.UserSessionMappingRepository;

import jakarta.transaction.Transactional;

@Service
public class WeeklyReportService {
    @Autowired
    private UserSessionMappingRepository userSessionMappingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public void sendWeeklyReports() {
        OffsetDateTime fiveDaysAgo = OffsetDateTime.now().minusDays(5);

        // Fetch all users inactive for more than 5 days
        List<User> inactiveUsers = userSessionMappingRepository.findInactiveUsersSince(fiveDaysAgo);

        // Separate users with valid emails
        List<User> usersWithEmails = inactiveUsers.stream()
            .filter(user -> user.getUserEmail() != null && !user.getUserEmail().isEmpty())
            .collect(Collectors.toList());

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
                // Find the top scorer in this cohort
                UserCohortMapping topper = users.stream()
                    .flatMap(user -> user.getUserCohortMappings().stream())
                    .filter(mapping -> cohortId.equals(String.valueOf(mapping.getCohort().getCohortId())))
                    .max(Comparator.comparingInt(UserCohortMapping::getLeaderboardScore))
                    .orElse(null);

                // Send report email to admin
                sendEmailToOrganizationAdmin(orgId, cohortId, users, topper);

                // Send individual emails to users
                usersWithEmails.forEach(user -> sendInactiveUserEmail(user, topper));
            });
        });
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

        String subject = "We've Missed You! 🥺 Time to Get Back in the Game! 🎉";
        StringBuilder emailBody = new StringBuilder()
            .append("Hello ").append(user.getUserName()).append(",\n\n")
            .append("We’ve noticed you've been taking a little break from us since ")
            .append("5 days ago").append(". It’s been 5 days without your amazing presence, ")
            .append("and we’re starting to feel like our favorite TV show got canceled mid-season! 📺🥺\n\n")
            .append("Your learning journey awaits, and we can’t wait to see you back in action. Think of all the new things you can discover, the skills you can master, and the fun you can have!\n\n")
            .append("Click here to pick up where you left off and dive back into the world of learning: [Login Link: https://flowofenglish.thechippersage.com]\n\n")
            .append("Remember, every great adventure begins with a single step, and we’re here to make every step count!\n\n")
            .append("Looking forward to seeing you soon.\n\n")
            .append("Happy Learning!\n\n")
            .append("Thank you,\nChippersage Team");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getUserEmail());
        message.setSubject(subject);
        message.setText(emailBody.toString());
        mailSender.send(message);
    }
}
