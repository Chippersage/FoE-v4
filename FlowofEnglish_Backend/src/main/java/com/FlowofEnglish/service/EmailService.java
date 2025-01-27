package com.FlowofEnglish.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EmailService.class);


    public void sendEmail(String to, String subject, String body) {
        logger.info("Attempting to send email to: {}", to);
        System.out.println("Attempting to send email to: " + to);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            logger.info("Email content prepared. Subject: {}", subject);
            System.out.println("Email content prepared. Subject: " + subject);
            
            mailSender.send(message);
            
            logger.info("Email successfully sent to: {}", to);
            System.out.println("Email successfully sent to: " + to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", to, e.getMessage());
            System.err.println("Failed to send email to: " + to + ". Error: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace to console
            throw e; // Re-throw to be handled by caller
        }
    }

    public void sendUserCreationEmail(String userEmail, String userName, String userId, String plainPassword, 
    		List<String> programNames, List<String> cohortNames, String orgAdminEmail, String orgName, String userType) { 
    	
        String subject = "Welcome to Your Learning Journey!";
        
     // Building the list of programs and cohorts dynamically
        StringBuilder programCohortDetails = new StringBuilder();
        for (int i = 0; i < programNames.size(); i++) {
            programCohortDetails.append("Program Name: ").append(programNames.get(i)).append("\n");
            if (i < cohortNames.size()) {
                programCohortDetails.append("Cohort Name: ").append(cohortNames.get(i)).append("\n\n");
            }
        }
        
        String body = "Dear " + userName + ",\n\n"
                + "We are excited to welcome you to the following programs and cohorts as part of your learning journey:\n\n"
                + programCohortDetails
                + "To get started, please find your login credentials below:\n\n"
                + "User ID: " + userId + "\n"
                + "Password: " + plainPassword + "\n"
                + "User Type: " + userType + "\n\n"
                + "You can log in to the learning portal using the following link:\n"
                + "https://flowofenglish.thechippersage.com\n\n"
                + "If you have any questions or need assistance, please feel free to reach out to your organization administrator:\n"
                + "Administrator Email: " + orgAdminEmail + "\n"
                + "Organization Name: " + orgName + "\n\n"
                + "We are thrilled to have you onboard and look forward to your achievements in these programs. Let’s get started and make the most of this learning experience together!\n\n"
                + "Best regards,\n"
                + "Team Chippersage\n";

        sendEmail(userEmail, subject, body);
    }
    
    public void sendCohortAssignmentEmail(String userEmail, String userName, String cohortName, 
            String programName, String orgName) {
    	logger.info("Preparing cohort assignment email for user: {}, cohort: {}, program: {}", 
                userName, cohortName, programName);
            System.out.println("Preparing cohort assignment email for user: " + userName + 
                ", cohort: " + cohortName + ", program: " + programName);
            String subject = "Your Learning Adventure Just Got Even Better! 🌟";

            String body = "Hi " + userName + ",\n\n"
                        + "We’re thrilled to welcome you to the next step in your learning journey at " + orgName + "! 💡\n\n"
                        + "Here’s what’s new for you:\n"
                        + "👉 **Program Name**: " + programName + "\n"
                        + "👉 **Cohort Name**: " + cohortName + "\n\n"
                        + "This program is designed to help you grow, connect, and achieve your goals. We're confident that you'll find it both enriching and inspiring. 🎯\n\n"
                        + "Ready to get started? Simply log in to your account here:\n"
                        + "[Access Your Program](https://flowofenglish.thechippersage.com)\n\n"
                        + "Take this opportunity to:\n"
                        + "✅ Dive into new program content\n"
                        + "✅ Collaborate with your cohort members\n"
                        + "✅ Continue building your skills and knowledge\n\n"
                        + "Your growth matters to us, and we’re here to support you every step of the way. If you have any questions, feel free to reach out—we’ve got your back! 💪\n\n"
                        + "Let’s make this an amazing chapter in your learning journey.\n\n"
                        + "Warm regards,\n"
                        + "Team Chippersage\n\n"
                        + "P.S. Remember, every step you take is one closer to achieving your goals. Let’s do this together! 🚀";

        try {
            sendEmail(userEmail, subject, body);
        } catch (Exception e) {
            logger.error("Failed to send cohort assignment email. User: {}, Error: {}", userName, e.getMessage());
            System.err.println("Failed to send cohort assignment email. User: " + userName + ", Error: " + e.getMessage());
            throw e;
        }
    }
}
