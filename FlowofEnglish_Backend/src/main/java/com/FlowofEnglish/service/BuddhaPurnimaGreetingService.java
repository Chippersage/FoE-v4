package com.FlowofEnglish.service;

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
public class BuddhaPurnimaGreetingService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    private static final Logger logger = LoggerFactory.getLogger(BuddhaPurnimaGreetingService.class);
    
    // Define image paths as constants
    private static final String BUDDHA_PURNIMA_IMAGE = "images/buddha.png";
    private static final String LOGO_IMAGE = "images/ChipperSageLogo.png";

    @Transactional
    public void sendBuddhaPurnimaGreetings() {
        logger.info("Starting Buddha Purnima greeting email process...");
        long startTime = System.currentTimeMillis();
        // Get all users with email addresses
        List<User> usersWithEmails = userRepository.findAll().stream()
            .filter(user -> user.getUserEmail() != null && !user.getUserEmail().isEmpty())
            .collect(Collectors.toList());
        
        logger.info("Found {} users with valid emails", usersWithEmails.size());
        
        // Track successful emails
        int sentEmails = 0;
        long dbFetchTime = System.currentTimeMillis() - startTime;
        logger.info("Time taken to fetch users from database: {} ms", dbFetchTime);
        
        // Send Buddha Purnima greetings to all users
        for (User user : usersWithEmails) {
        	long emailStartTime = System.currentTimeMillis();
            try {
                sendBuddhaPurnimaGreeting(user);
                sentEmails++;
                long emailSendTime = System.currentTimeMillis() - emailStartTime;
                logger.info("Buddha Purnima greeting sent to user: {}, time taken: {} ms", 
                        user.getUserEmail(), emailSendTime);
                logger.info("Buddha Purnima greeting sent to user: {}", user.getUserEmail());
            } catch (Exception e) {
                logger.error("Failed to send Buddha Purnima greeting to user: {}. Error: {}", 
                            user.getUserEmail(), e.getMessage(), e);
                sendPlainTextFallbackEmail(user);
            }
        }
        long totalTime = System.currentTimeMillis() - startTime;
        logger.info("Completed Buddha Purnima greeting process. Sent emails to {} users in {} ms (avg {} ms per email).", 
                    sentEmails, totalTime, sentEmails > 0 ? totalTime/sentEmails : 0);
        logger.info("Completed Buddha Purnima greeting process. Sent emails to {} users.", sentEmails);
    }
    
    private void sendBuddhaPurnimaGreeting(User user) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setTo(user.getUserEmail());
        helper.setSubject("Celebrating Buddha Purnima 🌸 A Path to Enlightenment and Peace");
        
        StringBuilder emailBody = new StringBuilder()
            .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
            .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
            
            // Greeting header
            .append("<div style='text-align: center; margin-bottom: 20px;'>")
            .append("<h1 style='color: #9b7653;'>Buddha Purnima Celebrations</h1>")
            .append("<h2 style='color: #b08968;'>🌸 Embracing Wisdom, Compassion & Inner Peace 🕉️</h2>")
            .append("</div>")
            
            // Personalized greeting
            .append("<p>Dear ").append(user.getUserName()).append(",</p>")
            
            // Main message body
            .append("<p>As the full moon illuminates the sky this Buddha Purnima, the ChipperSage family extends warm wishes to you on this sacred occasion. ")
            .append("This auspicious day marks the birth, enlightenment, and nirvana of Lord Buddha, offering us a moment to reflect on his timeless teachings of peace, compassion, and mindfulness.</p>")
            
            // Insert Buddha Purnima image
            .append("<div style='text-align: center; margin: 20px 0;'>")
            .append("<img src='cid:buddhaPurnimaImage' alt='Buddha Purnima' style='max-width: 100%; height: auto; border-radius: 8px;'/>")
            .append("</div>")
            
            // Fun facts about Buddha
            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f7f3ee; border-radius: 8px;'>")
            .append("<h3 style='color: #9b7653; margin-top: 0;'>Did You Know? 🌟</h3>")
            .append("<ul style='color: #5a4636;'>")
            .append("<li>Buddha's given name was Siddhartha Gautama, and he was a prince who gave up royal luxuries to seek enlightenment.</li>")
            .append("<li>The Bodhi Tree under which Buddha attained enlightenment still exists in Bodh Gaya, India — it's a descendant of the original tree!</li>")
            .append("<li>Buddha's footprints, called Buddhapada, are among the earliest symbols of Buddhism before human representations were created.</li>")
            .append("<li>The word \"Buddha\" is not a name but a title meaning \"the awakened one\" or \"the enlightened one.\"</li>")
            .append("</ul>")
            .append("<p style='font-style: italic; text-align: center; color: #9b7653; margin-top: 10px;'>Just like words have different forms (like \"fish\" and \"fishes\"), Buddha's teachings have many forms but one essence: compassion.</p>")
            .append("</div>")
            
            // Inspirational message
            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f1ebe5; border-radius: 8px;'>")
            .append("<h3 style='color: #9b7653; margin-top: 0;'>The Wisdom of Buddha</h3>")
            .append("<p>Buddha Purnima reminds us that the path to true happiness lies not in material possessions but in cultivating inner peace and compassion. ")
            .append("As Buddha taught, \"Peace comes from within. Do not seek it without.\"</p>")
            .append("<p style='font-style: italic; text-align: center; color: #b08968;'>\"Three things cannot be long hidden: the sun, the moon, and the truth.\" - Buddha</p>")
            .append("</div>")
            
            // Message for students and teachers
            .append("<div style='text-align: center; margin: 20px 0; padding: 15px; background-color: #e9e1d8; border-radius: 8px;'>")
            .append("<p style='font-size: 16px; color: #9b7653;'><b>To Our Dedicated Language Learners</b></p>")
            .append("<p style='font-size: 16px; color: #b08968;'>Like Buddha's journey to enlightenment, your path to English fluency requires patience, practice, and perseverance.")
            .append(" Just as he taught that every journey begins with a single step, remember that every new word and phrase you learn ")
            .append("brings you closer to your goal.</p>")
            .append("<p style='font-size: 16px; color: #b08968;'>As Buddha said, \"Drop by drop is the water pot filled.\" Similarly, day by day, your knowledge grows.</p>")
            .append("<p style='font-size: 16px; color: #b08968;'><b>May your learning journey be filled with clarity and understanding!</b></p>")
            .append("</div>")
            
            // Learning connection
            .append("<p>On this Buddha Purnima, we invite you to embrace the Buddhist value of continuous learning and growth. ")
            .append("Just as Buddha encouraged his followers to question, learn, and discover truths for themselves, ")
            .append("we encourage you to approach your language learning with the same curious and dedicated spirit.</p>")
            
            // Mindful activity suggestion
            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f5f2ee; border-radius: 8px;'>")
            .append("<h3 style='color: #9b7653; margin-top: 0;'>Mindful Learning Activity 🍃</h3>")
            .append("<p>Try this mindful language practice inspired by Buddha's teachings: Take 5 minutes to focus solely on reading a short English passage. ")
            .append("Notice the shape of each word, its meaning, and how the words connect. When your mind wanders (and it will!), ")
            .append("gently bring your attention back to the text without judgment. This mindfulness practice can deepen both your concentration and comprehension.</p>")
            .append("</div>")
            
            // CTA Button
            .append("<div style='text-align: center; margin: 25px 0;'>")
            .append("<a href='https://flowofenglish.thechippersage.com' ")
            .append("style='display: inline-block; padding: 12px 25px; background: linear-gradient(135deg, #9b7653, #b08968); ")
            .append("color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>")
            .append("Continue Your Learning Path</a>")
            .append("</div>")
            
            // Support Information
            .append("<p>For any assistance during this festive period, please contact us at ")
            .append("<a href='mailto:support@thechippersage.com'>support@thechippersage.com</a>.</p>")
            
            // Sign-off
            .append("<p>Wishing you peace and enlightenment,</p>")
            .append("<p><b>The ChipperSage Team 🌟</b></p>")
            
            // Footer with Logo
            .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
            .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
            .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
            .append("</div>")
            
            .append("</div></body></html>");

        helper.setText(emailBody.toString(), true);
        
        // Add images as inline attachments
        helper.addInline("buddhaPurnimaImage", new ClassPathResource(BUDDHA_PURNIMA_IMAGE));
        helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
        
        mailSender.send(mimeMessage);
    }
    
    // Fallback method to send plain text emails if HTML email fails
    private void sendPlainTextFallbackEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getUserEmail());
            message.setSubject("Celebrating Buddha Purnima - A Path to Enlightenment and Peace");
            
            StringBuilder emailBody = new StringBuilder();
            
            emailBody.append("Dear ").append(user.getUserName()).append(",\n\n")
                .append("As the full moon illuminates the sky this Buddha Purnima, the ChipperSage family extends warm wishes to you on this sacred occasion. ")
                .append("This auspicious day marks the birth, enlightenment, and nirvana of Lord Buddha, offering us a moment to reflect on his timeless teachings of peace, compassion, and mindfulness.\n\n")
                .append("DID YOU KNOW?\n")
                .append("- Buddha's given name was Siddhartha Gautama, and he was a prince who gave up royal luxuries to seek enlightenment.\n")
                .append("- The Bodhi Tree under which Buddha attained enlightenment still exists in Bodh Gaya, India.\n")
                .append("- The word \"Buddha\" is not a name but a title meaning \"the awakened one\" or \"the enlightened one\".\n\n")
                .append("Buddha Purnima reminds us that the path to true happiness lies not in material possessions but in cultivating inner peace and compassion. ")
                .append("As Buddha taught, \"Peace comes from within. Do not seek it without.\"\n\n")
                .append("To Our Dedicated Language Learners: Like Buddha's journey to enlightenment, your path to English fluency requires patience, practice, and perseverance. ")
                .append("As Buddha said, \"Drop by drop is the water pot filled.\" Similarly, day by day, your knowledge grows.\n\n")
                .append("Continue your learning journey: https://flowofenglish.thechippersage.com\n\n")
                .append("For any assistance, please contact us at support@thechippersage.com.\n\n")
                .append("Wishing you peace and enlightenment,\n")
                .append("The ChipperSage Team");
            
            message.setText(emailBody.toString());
            mailSender.send(message);
            
            logger.info("Fallback plain text email sent to user: {}", user.getUserEmail());
        } catch (Exception e) {
            logger.error("Failed to send even fallback email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
        }
    }
    
    // Method to send a test email to a specific email address
    public void sendTestBuddhaPurnimaEmail(String emailAddress) {
        try {
            // Create a dummy user for testing
            User testUser = new User();
            testUser.setUserName("Test User");
            testUser.setUserEmail(emailAddress);
            
            // Send the Buddha Purnima email
            sendBuddhaPurnimaGreeting(testUser);
            logger.info("Test Buddha Purnima email sent to: {}", emailAddress);
        } catch (Exception e) {
            logger.error("Failed to send test Buddha Purnima email to: {}. Error: {}", emailAddress, e.getMessage(), e);
            
            // Try fallback email
            User testUser = new User();
            testUser.setUserName("Test User");
            testUser.setUserEmail(emailAddress);
            sendPlainTextFallbackEmail(testUser);
        }
    }
}

//package com.FlowofEnglish.service;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.stereotype.Service;
//
//import com.FlowofEnglish.model.*;
//import com.FlowofEnglish.repository.*;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import jakarta.transaction.Transactional;
//import jakarta.mail.MessagingException;
//import jakarta.mail.internet.MimeMessage;
//
//@Service
//public class GoodFridayGreetingService {
//    
//    @Autowired
//    private UserRepository userRepository;
//    
//    @Autowired
//    private JavaMailSender mailSender;
//    
//    private static final Logger logger = LoggerFactory.getLogger(GoodFridayGreetingService.class);
//    
//    // Define image paths as constants
//    private static final String GOOD_FRIDAY_IMAGE = "images/Good Friday.png";
//    private static final String LOGO_IMAGE = "images/ChipperSageLogo.png";
//
//    @Transactional
//    public void sendGoodFridayGreetings() {
//        logger.info("Starting Good Friday greeting email process...");
//        long startTime = System.currentTimeMillis();
//        // Get all users with email addresses
//        List<User> usersWithEmails = userRepository.findAll().stream()
//            .filter(user -> user.getUserEmail() != null && !user.getUserEmail().isEmpty())
//            .collect(Collectors.toList());
//        
//        logger.info("Found {} users with valid emails", usersWithEmails.size());
//        
//        // Track successful emails
//        int sentEmails = 0;
//        long dbFetchTime = System.currentTimeMillis() - startTime;
//        logger.info("Time taken to fetch users from database: {} ms", dbFetchTime);
//        
//        // Send Good Friday greetings to all users (regardless of organization)
//        for (User user : usersWithEmails) {
//        	long emailStartTime = System.currentTimeMillis();
//            try {
//                sendGoodFridayGreeting(user);
//                sentEmails++;
//                long emailSendTime = System.currentTimeMillis() - emailStartTime;
//                logger.info("Good Friday greeting sent to user: {}, time taken: {} ms", 
//                        user.getUserEmail(), emailSendTime);
//                logger.info("Good Friday greeting sent to user: {}", user.getUserEmail());
//            } catch (Exception e) {
//                logger.error("Failed to send Good Friday greeting to user: {}. Error: {}", 
//                            user.getUserEmail(), e.getMessage(), e);
//                sendPlainTextFallbackEmail(user);
//            }
//        }
//        long totalTime = System.currentTimeMillis() - startTime;
//        logger.info("Completed Good Friday greeting process. Sent emails to {} users in {} ms (avg {} ms per email).", 
//                    sentEmails, totalTime, sentEmails > 0 ? totalTime/sentEmails : 0);
//        logger.info("Completed Good Friday greeting process. Sent emails to {} users.", sentEmails);
//    }
//    
//    private void sendGoodFridayGreeting(User user) throws MessagingException {
//        MimeMessage mimeMessage = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
//        helper.setTo(user.getUserEmail());
//        helper.setSubject("Reflections on Good Friday 🕊️ A Time of Hope and Renewal");
//        
//        StringBuilder emailBody = new StringBuilder()
//            .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
//            .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
//            
//            // Greeting header
//            .append("<div style='text-align: center; margin-bottom: 20px;'>")
//            .append("<h1 style='color: #4a6da7;'>Good Friday Reflections</h1>")
//            .append("<h2 style='color: #5d7aa9;'>🕊️ A Season of Hope and New Beginnings 🌿</h2>")
//            .append("</div>")
//            
//            // Personalized greeting
//            .append("<p>Dear ").append(user.getUserName()).append(",</p>")
//            
//            // Main message body
//            .append("<p>As we observe Good Friday, the ChipperSage family extends warm wishes to you and your loved ones. ")
//            .append("This special time offers us a moment to pause, reflect, and embrace the spirit of renewal that spring brings.</p>")
//            
//            // Insert Good Friday image
//            .append("<div style='text-align: center; margin: 20px 0;'>")
//            .append("<img src='cid:goodFridayImage' alt='Good Friday' style='max-width: 100%; height: auto; border-radius: 8px;'/>")
//            .append("</div>")
//            
//            // Inspirational message
//            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f5f7fa; border-radius: 8px;'>")
//            .append("<h3 style='color: #4a6da7; margin-top: 0;'>A Time for Reflection</h3>")
//            .append("<p>Good Friday reminds us of the profound power of sacrifice, forgiveness, and the promise of new beginnings. ")
//            .append("It's a time to reflect on our journey, appreciate our blessings, and look forward with renewed hope and purpose.</p>")
//            .append("<p style='font-style: italic; text-align: center; color: #5d7aa9;'>\"Every ending has a new beginning.\"</p>")
//            .append("</div>")
//            
//            // Message for students and teachers
//            .append("<div style='text-align: center; margin: 20px 0; padding: 15px; background-color: #e8eef8; border-radius: 8px;'>")
//            .append("<p style='font-size: 16px; color: #4a6da7;'><b>To Our Dear Students and Teachers</b></p>")
//            .append("<p style='font-size: 16px; color: #5d7aa9;'>As you take a brief pause from your learning journey,")
//            .append(" remember that rest is an essential part of growth. Just like nature renews itself in spring,")
//            .append(" may this break refresh your mind and spirit.</p>")
//            .append("<p style='font-size: 16px; color: #5d7aa9;'>Whether you're grading papers or completing assignments,")
//            .append(" we hope you find moments of joy and reflection during this time.</p>")
//            .append("<p style='font-size: 16px; color: #5d7aa9;'><b>Remember: The best teachers and learners are those who never stop growing!</b></p>")
//            .append("</div>")
//            
//            // Learning connection
//            .append("<p>As we observe this meaningful time, we invite you to continue your journey of growth and learning. ")
//            .append("Just as this season represents renewal, your commitment to improving your English skills represents ")
//            .append("your own personal journey of transformation and growth.</p>")
//            
//            // Fun activity suggestion
//            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f0f4f9; border-radius: 8px;'>")
//            .append("<h3 style='color: #4a6da7; margin-top: 0;'>Holiday Activity Idea ✏️</h3>")
//            .append("<p>During this break, why not start a gratitude journal in English? Each day, write down three things you're grateful for. ")
//            .append("This simple practice not only improves your writing skills but also cultivates positivity and mindfulness.</p>")
//            .append("</div>")
//            
//            // CTA Button
//            .append("<div style='text-align: center; margin: 25px 0;'>")
//            .append("<a href='https://flowofenglish.thechippersage.com' ")
//            .append("style='display: inline-block; padding: 12px 25px; background: linear-gradient(135deg, #4a6da7, #5d7aa9); ")
//            .append("color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>")
//            .append("Continue Your Learning Journey</a>")
//            .append("</div>")
//            
//            // Support Information
//            .append("<p>For any assistance during the holiday period, please contact us at ")
//            .append("<a href='mailto:support@thechippersage.com'>support@thechippersage.com</a>.</p>")
//            
//            // Sign-off
//            .append("<p>Wishing you peace and renewal,</p>")
//            .append("<p><b>The ChipperSage Team 🌟</b></p>")
//            
//            // Footer with Logo
//            .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
//            .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
//            .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
//            .append("</div>")
//            
//            .append("</div></body></html>");
//
//        helper.setText(emailBody.toString(), true);
//        
//        // Add images as inline attachments
//        helper.addInline("goodFridayImage", new ClassPathResource(GOOD_FRIDAY_IMAGE));
//        helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
//        
//        mailSender.send(mimeMessage);
//    }
//    
//    // Fallback method to send plain text emails if HTML email fails
//    private void sendPlainTextFallbackEmail(User user) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(user.getUserEmail());
//            message.setSubject("Good Friday Reflections - A Time of Hope and Renewal");
//            
//            StringBuilder emailBody = new StringBuilder();
//            
//            emailBody.append("Dear ").append(user.getUserName()).append(",\n\n")
//                .append("As we observe Good Friday, the ChipperSage family extends warm wishes to you and your loved ones. ")
//                .append("This special time offers us a moment to pause, reflect, and embrace the spirit of renewal that spring brings.\n\n")
//                .append("Good Friday reminds us of the profound power of sacrifice, forgiveness, and the promise of new beginnings. ")
//                .append("It's a time to reflect on our journey, appreciate our blessings, and look forward with renewed hope and purpose.\n\n")
//                .append("To Our Dear Students and Teachers: As you take a brief pause from your learning journey, ")
//                .append("remember that rest is an essential part of growth. Just like nature renews itself in spring, ")
//                .append("may this break refresh your mind and spirit.\n\n")
//                .append("Continue your learning journey: https://flowofenglish.thechippersage.com\n\n")
//                .append("For any assistance, please contact us at support@thechippersage.com.\n\n")
//                .append("Wishing you peace and renewal,\n")
//                .append("The ChipperSage Team");
//            
//            message.setText(emailBody.toString());
//            mailSender.send(message);
//            
//            logger.info("Fallback plain text email sent to user: {}", user.getUserEmail());
//        } catch (Exception e) {
//            logger.error("Failed to send even fallback email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
//        }
//    }
//    
//    // Method to send a test email to a specific email address
//    public void sendTestGoodFridayEmail(String emailAddress) {
//        try {
//            // Create a dummy user for testing
//            User testUser = new User();
//            testUser.setUserName("Test User");
//            testUser.setUserEmail(emailAddress);
//            
//            // Send the Good Friday email
//            sendGoodFridayGreeting(testUser);
//            logger.info("Test Good Friday email sent to: {}", emailAddress);
//        } catch (Exception e) {
//            logger.error("Failed to send test Good Friday email to: {}. Error: {}", emailAddress, e.getMessage(), e);
//            
//            // Try fallback email
//            User testUser = new User();
//            testUser.setUserName("Test User");
//            testUser.setUserEmail(emailAddress);
//            sendPlainTextFallbackEmail(testUser);
//        }
//    }
//}




//package com.FlowofEnglish.service;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.stereotype.Service;
//
//import com.FlowofEnglish.model.*;
//import com.FlowofEnglish.repository.*;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import jakarta.transaction.Transactional;
//import jakarta.mail.MessagingException;
//import jakarta.mail.internet.MimeMessage;
//
//@Service
//public class HoliGreetingService {
//    
//    @Autowired
//    private UserRepository userRepository;
//    
//    @Autowired
//    private JavaMailSender mailSender;
//    
//    private static final Logger logger = LoggerFactory.getLogger(HoliGreetingService.class);
//    
//    private static final String TEAM_ORG_ID = "TEAM";
//    
//    // Define image paths as constants
//    private static final String HOLI_IMAGE = "images/Holi.png";
//    private static final String LOGO_IMAGE = "images/ChipperSageLogo.png";
//    private static final String GoodFriday_IMAGE = "images/Good Friday.png";
//
//    @Transactional
//    public void sendHoliGreetings() {
//        logger.info("Starting Holi greeting email process...");
//        
//        // Get all users with email addresses
//        List<User> usersWithEmails = userRepository.findAll().stream()
//            .filter(user -> user.getUserEmail() != null && !user.getUserEmail().isEmpty())
//            .collect(Collectors.toList());
//        
//        logger.info("Found {} users with valid emails", usersWithEmails.size());
//        
//        // Group users by organization
//        Map<String, List<User>> usersByOrg = usersWithEmails.stream()
//            .collect(Collectors.groupingBy(
//                user -> user.getOrganization() != null && user.getOrganization().getOrganizationId() != null 
//                      ? user.getOrganization().getOrganizationId() 
//                      : "Unknown"
//            ));
//        
//        // Track successful emails
//        int sentEmails = 0;
//
//        // Process Team org users separately (Hindi greetings)
//        if (usersByOrg.containsKey(TEAM_ORG_ID)) {
//            List<User> teamUsers = usersByOrg.get(TEAM_ORG_ID);
//            for (User user : teamUsers) {
//                try {
//                    sendTeamHoliGreeting(user);
//                    sentEmails++;
//                    logger.info("Hindi Holi greeting sent to Team user: {}", user.getUserEmail());
//                } catch (Exception e) {
//                    logger.error("Failed to send Hindi Holi greeting to user: {}. Error: {}", 
//                                user.getUserEmail(), e.getMessage(), e);
//                    sendPlainTextFallbackEmail(user, "होली की हार्दिक शुभकामनाएँ!", true);
//                }
//            }
//            // Remove processed users
//            usersByOrg.remove(TEAM_ORG_ID);
//        }
//        
//        // Process other org users (English greetings)
//        for (Map.Entry<String, List<User>> entry : usersByOrg.entrySet()) {
//            String orgId = entry.getKey();
//            List<User> users = entry.getValue();
//            
//            logger.info("Processing {} users from organization: {}", users.size(), orgId);
//            
//            for (User user : users) {
//                try {
//                    sendEnglishHoliGreeting(user);
//                    sentEmails++;
//                    logger.info("English Holi greeting sent to user: {}", user.getUserEmail());
//                } catch (Exception e) {
//                    logger.error("Failed to send English Holi greeting to user: {}. Error: {}", 
//                                user.getUserEmail(), e.getMessage(), e);
//                    sendPlainTextFallbackEmail(user, "Happy Holi!", false);
//                }
//            }
//        }
//        
//        logger.info("Completed Holi greeting process. Sent emails to {} users.", sentEmails);
//    }
//    
//    private void sendTeamHoliGreeting(User user) throws MessagingException {
//        MimeMessage mimeMessage = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
//        helper.setTo(user.getUserEmail());
//        helper.setSubject("Heartfelt Holi Greetings! 🎨 Wishing You a Joyous Festival of Colors!");
//        
//        StringBuilder emailBody = new StringBuilder()
//            .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
//            .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
//            
//            // Colorful greeting header
//            .append("<div style='text-align: center; margin-bottom: 20px;'>")
//            .append("<h1 style='color: #ff1493;'>होली की हार्दिक शुभकामनाएँ!</h1>")
//            .append("<h2 style='color: #9370db;'>🎨 रंगों का त्योहार मुबारक हो! 🎉</h2>")
//            .append("</div>")
//            
//            // Personalized greeting
//            .append("<p>प्रिय ").append(user.getUserName()).append(" जी,</p>")
//            
//            // Main message body
//            .append("<p>The ChipperSage family wishes you and your loved ones a very Happy Holi! 🌸💖 ")
//            .append("May this festival of colors fill your life with happiness, prosperity, and vibrant new beginnings. Let’s celebrate love, laughter, and the spirit of togetherness!</p>")
//            
//            // Insert Holi image
//            .append("<div style='text-align: center; margin: 20px 0;'>")
//            .append("<img src='cid:holiImage' alt='Holi Celebration' style='max-width: 100%; height: auto; border-radius: 8px;'/>")
//            .append("</div>")
//            
//            // Fun and Festive Holi Message
//            .append("<div style='text-align: center; margin: 20px 0; padding: 15px; background-color: #ffebcd; border-radius: 8px;'>")
//            .append("<p style='font-size: 18px; color: #d2691e;'><b>होली है! 🎨🌈</b></p>")
//            .append("<p style='font-size: 16px; color: #8b0000;'>गुझिया की मिठास, रंगों की बौछार, पिचकारी की धार, और खुशियों की बहार...</p>")
//            .append("<p style='font-size: 16px; color: #8b0000;'>खूब खेलो, मुस्कुराओ और होली को पूरे जोश से मनाओ! 💃🎶</p>")
//            .append("</div>")
//
//            // Additional Joyful Holi Message
//            .append("<div style='text-align: center; margin: 20px 0; padding: 15px; background-color: #f3f3f3; border-radius: 8px;'>")
//            .append("<p style='font-size: 16px; color: #ff4500;'><b>होली के रंग ऐसे खेलो, कि चेहरे पर मुस्कान और दिल में खुशियाँ छा जाएँ!</b></p>")
//            .append("<p style='font-size: 16px; color: #ff4500;'>पानी की जगह प्यार की बौछार हो, और गुलाल की जगह अपनों का साथ हो!</p>")
//            .append("<p style='font-size: 16px; color: #ff4500;'>भांग थोड़ी कम और भंगड़ा थोड़ा ज़्यादा! 😆</p>")
//            .append("<p style='font-size: 16px; color: #ff4500;'>बुरा ना मानो होली है, पर ज़्यादा बुरा भी मत मानो! 😄</p>")
//            .append("<p style='font-size: 16px; color: #ff4500;'><b>रंगों से भरी पिचकारी और प्यार से भरे गुलाल, यही है होली का असली कमाल! हैप्पी होली! 🎉</b></p>")
//            .append("</div>")
//            
//            // Learning message with Flow of English reference
//            .append("<p>On this occasion of Holi, we also encourage you to continue your journey of learning English.")
//            .append("Just like the colors of Holi, the colors of knowledge are equally important in life!</p>")
//            
//            // CTA Button
//            .append("<div style='text-align: center; margin: 25px 0;'>")
//            .append("<a href='https://flowofenglish.thechippersage.com' ")
//            .append("style='display: inline-block; padding: 12px 25px; background: linear-gradient(135deg, #ff416c, #ff4b2b); ")
//            .append("color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>")
//            .append("Flow of English पर जाएं!</a>")
//            .append("</div>")
//            
//            // Support Information
//            .append("<p>किसी भी सहायता के लिए हमें ")
//            .append("<a href='mailto:support@thechippersage.com'>support@thechippersage.com</a> पर संपर्क करें।</p>")
//            
//            // Sign-off
//            .append("<p>Best wishes,</p>")
//            .append("<p><b>Team ChipperSage 🌟</b></p>")
//            
//            // Footer with Logo
//            .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
//            .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
//            .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
//            .append("</div>")
//            
//            .append("</div></body></html>");
//
//        helper.setText(emailBody.toString(), true);
//        
//        // Add images as inline attachments
//        helper.addInline("holiImage", new ClassPathResource(HOLI_IMAGE));
//        helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
//        
//        mailSender.send(mimeMessage);
//    }
//    
//    private void sendEnglishHoliGreeting(User user) throws MessagingException {
//        MimeMessage mimeMessage = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
//        helper.setTo(user.getUserEmail());
//        helper.setSubject("Happy Holi! 🎨 Celebrate the Festival of Colors!");
//        
//        StringBuilder emailBody = new StringBuilder()
//            .append("<html><body style='font-family: Arial, sans-serif; color: #333333;'>")
//            .append("<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>")
//            
//            // Colorful greeting header
//            .append("<div style='text-align: center; margin-bottom: 20px;'>")
//            .append("<h1 style='color: #ff1493;'>Happy Holi!</h1>")
//            .append("<h2 style='color: #9370db;'>🎨 Celebrate the Festival of Colors! 🎉</h2>")
//            .append("</div>")
//            
//            // Personalized greeting
//            .append("<p>Dear ").append(user.getUserName()).append(",</p>")
//            
//            // Main message body
//            .append("<p>Warm wishes from the ChipperSage family for a vibrant and joyous Holi! ")
//            .append("May this colorful festival bring new hues of happiness to your life and wash away all your worries.</p>")
//            
//            // Insert Holi image
//            .append("<div style='text-align: center; margin: 20px 0;'>")
//            .append("<img src='cid:holiImage' alt='Holi Celebration' style='max-width: 100%; height: auto; border-radius: 8px;'/>")
//            .append("</div>")
//            
//            // Holi information
//            .append("<div style='margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px;'>")
//            .append("<h3 style='color: #4a86e8; margin-top: 0;'>About Holi</h3>")
//            .append("<p>Holi is one of India's most beloved festivals, celebrating the victory of good over evil ")
//            .append("and the arrival of spring. It's a time when people come together to play with colors, ")
//            .append("forgive past conflicts, and strengthen community bonds.</p>")
//            .append("</div>")
//            
//            // Learning connection
//            .append("<p>As we celebrate this festival of colors, we'd also like to encourage you to continue ")
//            .append("your English learning journey. Just as colors add beauty to our lives, language adds depth to our understanding of the world!</p>")
//            
//            // CTA Button
//            .append("<div style='text-align: center; margin: 25px 0;'>")
//            .append("<a href='https://flowofenglish.thechippersage.com' ")
//            .append("style='display: inline-block; padding: 12px 25px; background: linear-gradient(135deg, #4a86e8, #87CEEB); ")
//            .append("color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>")
//            .append("Visit Flow of English!</a>")
//            .append("</div>")
//            
//            // Support Information
//            .append("<p>For any assistance, please contact us at ")
//            .append("<a href='mailto:support@thechippersage.com'>support@thechippersage.com</a>.</p>")
//            
//            // Sign-off
//            .append("<p>With warm regards,</p>")
//            .append("<p><b>The ChipperSage Team 🌟</b></p>")
//            
//            // Footer with Logo
//            .append("<div style='margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 20px; text-align: center;'>")
//            .append("<img src='cid:logoImage' alt='ChipperSage Logo' style='max-width: 150px; height: auto;'/>")
//            .append("<p style='color: #777777; font-size: 12px;'>© 2025 ChipperSage. All rights reserved.</p>")
//            .append("</div>")
//            
//            .append("</div></body></html>");
//
//        helper.setText(emailBody.toString(), true);
//        
//        // Add images as inline attachments
//        helper.addInline("holiImage", new ClassPathResource(HOLI_IMAGE));
//        helper.addInline("logoImage", new ClassPathResource(LOGO_IMAGE));
//        
//        mailSender.send(mimeMessage);
//    }
//    
//    // Fallback method to send plain text emails if HTML email fails
//    private void sendPlainTextFallbackEmail(User user, String subject, boolean isHindi) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(user.getUserEmail());
//            message.setSubject(subject);
//            
//            StringBuilder emailBody = new StringBuilder();
//            
//            if (isHindi) {
//            	emailBody.append("प्रिय ").append(user.getUserName()).append(" जी,\n\n")
//                .append("चिपरसेज परिवार की ओर से आपको और आपके परिवार को होली की हार्दिक शुभकामनाएँ! ")
//                .append("आशा है कि यह रंगों का त्योहार आपके जीवन में खुशियों के नए रंग भर दे।\n\n")
//                .append("होली के इस मौके पर, हम आपको अंग्रेजी सीखने की यात्रा जारी रखने के लिए भी प्रोत्साहित करना चाहते हैं।\n\n")
//                .append("Flow of English देखने के लिए: https://flowofenglish.thechippersage.com\n\n")
//                .append("किसी भी सहायता के लिए हमें support@thechippersage.com पर संपर्क करें।\n\n")
//                .append("शुभकामनाओं सहित,\n")
//                .append("चिपरसेज टीम");
//     } else {
//         emailBody.append("Dear ").append(user.getUserName()).append(",\n\n")
//                .append("Warm wishes from the ChipperSage family for a vibrant and joyous Holi! ")
//                .append("May this colorful festival bring new hues of happiness to your life.\n\n")
//                .append("As we celebrate this festival of colors, we'd also like to encourage you to continue ")
//                .append("your English learning journey.\n\n")
//                .append("Visit Flow of English: https://flowofenglish.thechippersage.com\n\n")
//                .append("For any assistance, please contact us at support@thechippersage.com.\n\n")
//                .append("With warm regards,\n")
//                .append("The ChipperSage Team");
//     }
//     
//     message.setText(emailBody.toString());
//     mailSender.send(message);
//     
//     logger.info("Fallback plain text email sent to user: {}", user.getUserEmail());
// } catch (Exception e) {
//     logger.error("Failed to send even fallback email to user: {}. Error: {}", user.getUserEmail(), e.getMessage(), e);
// }
//}
//
//// Method to send a test email to a specific email address
//public void sendTestHoliEmail(String emailAddress, boolean isHindi) {
// try {
//     // Create a dummy user for testing
//     User testUser = new User();
//     testUser.setUserName("Test User");
//     testUser.setUserEmail(emailAddress);
//     
//     // Send the appropriate email based on language preference
//     if (isHindi) {
//         sendTeamHoliGreeting(testUser);
//         logger.info("Test Hindi Holi email sent to: {}", emailAddress);
//     } else {
//         sendEnglishHoliGreeting(testUser);
//         logger.info("Test English Holi email sent to: {}", emailAddress);
//     }
// } catch (Exception e) {
//     logger.error("Failed to send test Holi email to: {}. Error: {}", emailAddress, e.getMessage(), e);
//     
//     // Try fallback email
//     User testUser = new User();
//     testUser.setUserName("Test User");
//     testUser.setUserEmail(emailAddress);
//     sendPlainTextFallbackEmail(testUser, isHindi ? "होली की हार्दिक शुभकामनाएँ!" : "Happy Holi!", isHindi);
// }
//}
//}