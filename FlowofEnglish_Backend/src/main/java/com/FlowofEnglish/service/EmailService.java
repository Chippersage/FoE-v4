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

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
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

}
