package com.FlowofEnglish.service;

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

    public void sendUserCreationEmail(String userEmail, String userName, String userId, String plainPassword, String programName, String programId, String cohortName, String orgAdminEmail, String orgName) { 
        String subject = "Welcome to " + programName + "!";
        String body = "Dear " + userName + ",\n\n"
                + "We are delighted to welcome you to the " + programName + " (Program ID: " + programId + "). You are now part of an exciting learning journey, and we are committed to supporting you every step of the way.\n\n"
                + "To get started, please find your login credentials below:\n\n"
                + "User ID: " + userId + "\n"
                + "Password: " + plainPassword + "\n\n"
                + "You can log in to the learning portal using the following link:\n"
                + "https://flowofenglish.thechippersage.com/sign-in\n\n"
                + "If you have any questions or need assistance, please feel free to reach out to your organization administrator:\n"
                + "Administrator Email: " + orgAdminEmail + "\n"
                + "Organization Name: " + orgName + "\n"
                + "Cohort Name: " + cohortName + "\n\n"
                + "We are thrilled to have you onboard and look forward to your achievements in this program. Let’s get started and make the most of this learning experience together!\n\n"
                + "Best regards,\n"
                + "Team Chippersage\n";

        sendEmail(userEmail, subject, body);
    }

}
