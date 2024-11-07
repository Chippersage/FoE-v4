package com.FlowofEnglish.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.repository.OrganizationRepository;
import com.FlowofEnglish.util.RandomStringUtil;
import jakarta.persistence.EntityNotFoundException;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;
    



    // Temporary store for OTPs (in a real-world app, use a more secure solution like Redis)
    private Map<String, String> otpStorage = new HashMap<>();

 // Generate a random 6-letter password
    private String generatePassword() {
        return RandomStringUtil.generateRandomAlphabetic(6); // Generates a random string of 6 letters
    }
 
 // Method to generate a random OTP
    private String generateOTP() {
        return RandomStringUtil.generateRandomNumeric(6); // Generates a random 6-digit OTP
    }

    // Method to send OTP via email
    private void sendOTPEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP for Password Reset");
        message.setText("Your OTP for resetting the password is: " + otp);
        mailSender.send(message);
    }

    // Method to handle forgotten password
    public void sendForgotPasswordOTP(String email) {
        Organization organization = getOrganizationByEmail(email);
        if (organization != null) {
            String otp = generateOTP();
            otpStorage.put(email, otp); // Store OTP in memory (temporary solution)
            sendOTPEmail(email, otp); // Send OTP via email
        } else {
            throw new RuntimeException("Organization not found with email: " + email);
        }
    }

    // Method to reset the organization password using OTP
    public void resetPassword(String organisationName, String email, String otp) {
        Organization organization = getOrganizationByEmail(email);
        if (organization == null) {
            throw new RuntimeException("Organization not found with email: " + email);
        }

        if (!otpStorage.containsKey(email) || !otpStorage.get(email).equals(otp)) {
            throw new RuntimeException("Invalid OTP.");
        }

        // OTP is valid; generate a new password
        String newPassword = generateNewPassword();
        String encodedPassword = passwordEncoder.encode(newPassword);
        organization.setOrgpassword(encodedPassword);

        // Save the updated organization password
        organizationRepository.save(organization);

        // Send new password to the organization's email
        sendNewPasswordEmail(email, newPassword);

        // Remove OTP after successful password reset
        otpStorage.remove(email);
    }

    
   // Method to generate a new random password
    private String generateNewPassword() {
        return RandomStringUtil.generateRandomAlphanumeric(8); // Generates an 8-character alphanumeric password
    }

    // Method to send the new password to the organization's email
    private void sendNewPasswordEmail(String to, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your New Password");
        message.setText("Your password has been reset. Your new password is: " + newPassword);
        mailSender.send(message);
    }

    // Save or update an organization
    @Transactional
    public Organization saveOrganization(Organization organization) {
        System.out.println("Attempting to save organization: " + organization);

        String plainPassword = organization.getOrgpassword();
        if (plainPassword == null || plainPassword.isEmpty()) {
            plainPassword = generatePassword();
            organization.setOrgpassword(plainPassword);
        }

        String encodedPassword = passwordEncoder.encode(plainPassword);
        organization.setOrgpassword(encodedPassword);

        Organization savedOrganization = organizationRepository.save(organization);
        System.out.println("Saved organization: " + savedOrganization);

        sendCredentialsEmail(organization.getOrganizationAdminEmail(), organization.getOrganizationAdminEmail(), plainPassword);

        return savedOrganization;
    }

    private void sendCredentialsEmail(String to, String username, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Organization Credentials");
        message.setText("Your credentials are as follows:\n\nUsername: " + username + "\nPassword: " + password);
        mailSender.send(message);
    }

    public Organization getOrganizationByEmail(String email) {
        System.out.println("OrganizationByEmail");
        return organizationRepository.findByOrganizationAdminEmail(email);
    }

    // Retrieve all organizations
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    // Retrieve an organization by ID
    public Organization getOrganizationById(String id) {
        Optional<Organization> organization = organizationRepository.findById(id);
        if (organization.isPresent()) {
            return organization.get();
        } else {
            throw new RuntimeException("Organization not found with id: " + id);
        }
    }

    // Delete an organization by ID
    public void deleteOrganization(String organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(() -> new EntityNotFoundException("Organization not found"));
        organization.setDeletedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        organizationRepository.save(organization);
    }
    // Create a new organization
    public Organization createOrganization(Organization organization) {
        return saveOrganization(organization);
    }

    // Create multiple organizations
    public List<Organization> createOrganizations(List<Organization> organizations) {
        return organizationRepository.saveAll(organizations);
    }
    
    public boolean verifyPassword(String plainPassword, String encodedPassword) {
        return passwordEncoder.matches(plainPassword, encodedPassword);
    }

}
