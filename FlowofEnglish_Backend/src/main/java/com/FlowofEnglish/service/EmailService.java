package com.FlowofEnglish.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;



import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;

    
 //   private static final String LOGO_IMAGE = "images/ChipperSageLogo.png";
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EmailService.class);


    public void sendEmailWithAttachment(String to, String mentorName, String cohortName, Path filePath) {
        try {
            logger.info("Sending email with assignment attachment to {}", to);

            String subject = "Assignments for Cohort " + cohortName + " – Please Review and Provide Feedback";

            String body = "<html><body style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
                    "<p>Dear " + mentorName + ",</p>" +
                    "<p>I hope this email finds you well.</p>" +
                    "<p>Please find attached a ZIP file containing the assignments submitted by learners from the cohort <b>" + cohortName + "</b>. " +
                    "The ZIP file includes individual assignment files as well as a CSV file (assignments-details.csv) with relevant details.</p>" +
                    "<p><b>Instructions for Review:</b></p>" +
                    "<ol>" +
                    "<li>Extract the ZIP File: Use any standard extraction tool to open the ZIP file.</li>" +
                    "<li>Review Assignments: Evaluate each assignment based on the given criteria.</li>" +
                    "<li>Update the CSV File:" +
                    "<ul>" +
                    "<li>Enter the score for each learner in the 'Score' column.</li>" +
                    "<li>Provide any necessary feedback in the 'Remarks' column.</li>" +
                    "</ul></li>" +
                    "<li>Send Back the Reviewed Assignments: Reply to this email with the updated CSV file and any additional comments.</li>" +
                    "</ol>" +
                    "<p><b>Submission Deadline:</b></p>" +
                    "<p>Kindly complete the review and return the corrected assignments within 5 days from the date of this email.</p>" +
                    "<p>If you have any questions or require assistance, feel free to reach out.</p>" +
                    "<p>Thank you for your time and support in guiding the learners.</p>" +
                    "<p>Best regards,<br>" +
                    "Team Chippersage<br>" +
                    "support@thechippersage.com</p>" +
                    "</body></html>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // Set true to enable HTML formatting

            // Attach the file
            FileSystemResource file = new FileSystemResource(filePath.toFile());
            helper.addAttachment(file.getFilename(), file);

            mailSender.send(message);

            logger.info("Email with attachment sent successfully to {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send email with attachment to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email with attachment", e);
        } finally {
            try {
                Files.deleteIfExists(filePath);
                logger.info("Temporary zip file deleted: {}", filePath);
            } catch (IOException e) {
                logger.error("Failed to delete temporary zip file: " + filePath, e);
            }
        }
    }
    
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

    
    public void sendEmailWithCSVAttachment(String recipientEmail, String recipientName, String cohortName, Path csvFilePath) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(recipientEmail);
            helper.setSubject("Assignment Review Instructions for Cohort: " + cohortName);
            
            // Get organization admin email from the mentor's organization
            String orgAdminEmail = getUserOrganizationAdminEmail(recipientEmail);
            
            String emailBody = 
                "Dear " + recipientName + ",\n\n" +
                "Attached is the assignments CSV file for cohort: " + cohortName + ". Please follow these instructions for reviewing:\n\n" +
                "1. Open the attached CSV file to view all learner assignments\n" +
                "2. Click on the FileDownloadLink for each submission to access the learner's work\n" +
                "3. Review each assignment carefully based on our assessment rubric\n" +
                "4. When scoring, please note the MaxScore column and ensure scores do not exceed this value\n" +
                "5. For each assignment, provide detailed feedback in the Remarks column addressing:\n" +
                "   - Strengths of the submission\n" +
                "   - Areas needing improvement\n" +
                "   - Specific suggestions for growth\n\n" +
                "6. If you need to provide corrected files or additional resources, please:\n" +
                "   - Save the file with naming format: [UserID]_[AssignmentId]_corrected\n" +
                "   - Update the Score and Remarks columns in the CSV\n" +
                "   - Send the completed CSV file and any corrected files to: " + orgAdminEmail + "\n\n" +
                "Please complete your reviews within 3 business days. Your thoughtful feedback is essential to our learners' growth and success.\n\n" +
                "Thank you for your dedication to our learners' development.\n\n" +
                "Best regards,\nFlow of English Team";
            
            helper.setText(emailBody);
            
            // Attach the CSV file
            FileSystemResource file = new FileSystemResource(csvFilePath.toFile());
            helper.addAttachment("assignments-details.csv", file);
            
            mailSender.send(message);
            logger.info("Email with CSV attachment and instructions sent successfully to {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send email with CSV attachment: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending email", e);
        }
    }
    
    // New helper method to get organization admin email for a user
    private String getUserOrganizationAdminEmail(String userEmail) {
        try {
            // This would need to be implemented based on your repository structure
            // Example implementation:
            User user = userRepository.findByUserEmail(userEmail);
            if (user != null && user.getOrganization() != null) {
                return user.getOrganization().getOrganizationAdminEmail();
            }
            // Default fallback email if needed
            return "support@thechippersage.com";
        } catch (Exception e) {
            logger.error("Error fetching organization admin email: {}", e.getMessage());
            // Return a default admin email as fallback
            return "support@thechippersage.com";
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
