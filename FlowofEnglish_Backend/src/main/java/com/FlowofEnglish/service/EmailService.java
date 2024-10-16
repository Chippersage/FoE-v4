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

    public void sendUserCreationEmail(String userEmail, String userName, String userId, String plainPassword, String programName, String cohortName, String orgAdminEmail, String orgName) {
        String subject = "Welcome to " + programName + "!";
        String body = "Dear " + userName + ",\n\n"
                + "We are delighted to welcome you to " + programName + " ! You are now part of an exciting learning journey, and we are here to support you every step of the way.\n\n"
                + "To get started, please find your login credentials below:\n\n"
                + "User ID: " + userId + "\n"
                + "Password: " + plainPassword + "\n\n"
                + "You can log in to the learning portal using the following link:\n"
                + "Login Here Link\n\n"
                + "If you have any questions or need assistance, feel free to reach out to your organization administrator at " + orgAdminEmail + ".\n"
                + "Your organization name: " + orgName + "\n"
                + "Your cohort name: " + cohortName + "\n\n"
                + "We are thrilled to have you Onboard and look forward to your success in this program. Let's get started and make the most of this learning experience!\n\n"
                + "Best regards,\n"
                + "Latha Srinivasan\n";

        sendEmail(userEmail, subject, body);
    }
}
