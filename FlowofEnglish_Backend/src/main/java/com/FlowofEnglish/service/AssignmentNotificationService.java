package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AssignmentNotificationService {

    @Autowired
    private UserAssignmentRepository userAssignmentRepository;
    
    @Autowired
    private UserAssignmentService userAssignmentService;
    
    @Autowired
    private CohortRepository cohortRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;
    
    private static final Logger logger = LoggerFactory.getLogger(AssignmentNotificationService.class);

    @Scheduled(cron = "0 0 21 * * ?", zone = "Asia/Kolkata") // Every day at 9:00 PM IST
    public void notifyMentorsAndAdmins() {
        LocalDate today = LocalDate.now();
        OffsetDateTime startOfDay = today.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = today.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        // Fetch all assignments submitted today
        List<UserAssignment> assignments = userAssignmentRepository.findBySubmittedDateBetween(startOfDay, endOfDay);

        // Group assignments by cohort
        Map<Cohort, List<UserAssignment>> assignmentsByCohort = new HashMap<>();
        for (UserAssignment assignment : assignments) {
            Cohort cohort = assignment.getCohort();
            assignmentsByCohort.computeIfAbsent(cohort, k -> new ArrayList<>()).add(assignment);
        }
     // Track notified admins per organization
        Map<Organization, List<User>> orgAdminsMap = new HashMap<>();

        // Notify mentors and admins for each cohort
        for (Map.Entry<Cohort, List<UserAssignment>> entry : assignmentsByCohort.entrySet()) {
            Cohort cohort = entry.getKey();
            List<UserAssignment> cohortAssignments = entry.getValue();
            Organization org = cohort.getOrganization();
            String orgAdminEmail = org.getOrganizationAdminEmail();

            // Fetch mentor for the cohort
            User mentor = userRepository.findByUserTypeAndCohort("mentor", cohort)
                    .orElseThrow(() -> new RuntimeException("Mentor not found for cohort: " + cohort.getCohortId()));

         // Find all admins of the organization
            List<User> orgAdmins = userRepository.findByOrganizationAndUserType(org, "admin");
            orgAdminsMap.putIfAbsent(org, orgAdmins);

            // Prepare email content
            String subject = "Daily Assignment Submission Report";
            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(mentor.getUserName()).append(",\n\n");
            body.append("Here is the daily report of assignment submissions for cohort: ").append(cohort.getCohortName()).append("\n\n");
            body.append("Total submissions: ").append(cohortAssignments.size()).append("\n\n");
            body.append("List of learners who submitted assignments:\n");
            for (UserAssignment assignment : cohortAssignments) {
                body.append("- ").append(assignment.getUser().getUserName()).append(" (Assignment ID: ").append(assignment.getUuid()).append(")\n");
            }
            body.append("\nA detailed CSV report of assignments is attached to this email.\n");
            body.append("\nBest regards,\nTeam Chippersage");
         // Send email to mentor if exists
            if (mentor != null) {
            	try {
                    // Generate and email CSV for the specific cohort
                    userAssignmentService.generateAndEmailAssignmentsCSV(cohort.getCohortId());
                } catch (IOException e) {
                    logger.error("Failed to generate CSV for cohort {}: {}", cohort.getCohortId(), e.getMessage());
                    // Continue with email sending even if CSV generation fails
                }
                emailService.sendEmail(mentor.getUserEmail(), subject, "Dear " + mentor.getUserName() + ",\n\n" + body.toString());
            }

         // Send email to all organization admins
            for (User admin : orgAdmins) {
                emailService.sendEmail(admin.getUserEmail(), subject, "Dear " + admin.getUserName() + ",\n\n" + body.toString());
            }
            if (orgAdminEmail != null && !orgAdminEmail.isEmpty()) {
                emailService.sendEmail(orgAdminEmail, subject, "Dear" + org.getOrganizationAdminName() + ",\n\n" + body.toString());
            }
        }
    }
    

}