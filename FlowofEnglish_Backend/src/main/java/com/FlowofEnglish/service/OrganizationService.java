package com.FlowofEnglish.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.FlowofEnglish.dto.CohortDTO;
import com.FlowofEnglish.dto.ProgramResponseDTO;
import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.CohortProgram;
import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.repository.CohortProgramRepository;
import com.FlowofEnglish.repository.OrganizationRepository;
import com.FlowofEnglish.util.RandomStringUtil;
import jakarta.persistence.EntityNotFoundException;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private  CohortProgramRepository cohortProgramRepository;

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

    
 // Send OTP after verifying organization name and email
    public void sendForgotPasswordOTP(String organizationName, String email) {
        Organization organization = organizationRepository.findByOrganizationAdminEmail(email);
        if (organization == null || !organization.getOrganizationName().equalsIgnoreCase(organizationName)) {
            throw new RuntimeException("Invalid organization name or email.");
        }

        String otp = generateOTP();
        otpStorage.put(email, otp);
        sendOTPEmail(email, otp);
    }

    
 // Verify OTP and reset the password
    public void resetPassword(String organizationName, String email, String otp, String newPassword) {
        Organization organization = organizationRepository.findByOrganizationNameAndOrganizationAdminEmail(organizationName, email);
        if (organization == null) {
            throw new RuntimeException("Invalid organization name or email. Please try again.");
        }

        if (!otpStorage.containsKey(email) || !otpStorage.get(email).equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP. Please try again.");
        }

        // OTP is valid; update password
        String encodedPassword = passwordEncoder.encode(newPassword);
        organization.setOrgpassword(encodedPassword);

        organizationRepository.save(organization); // Save updated password
        sendNewPasswordEmail(email, newPassword); // Notify user of the updated password

        otpStorage.remove(email); // Clear the OTP after use
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
            plainPassword = generatePassword(); // Generate a new plain password
        }

        String encodedPassword = passwordEncoder.encode(plainPassword); // Hash the password
        organization.setOrgpassword(encodedPassword); // Store hashed password

        Organization savedOrganization = organizationRepository.save(organization);
        System.out.println("Saved organization: " + savedOrganization);

        sendWelcomeEmail(savedOrganization, plainPassword); // Send the plain password in email

        return savedOrganization;
    }

    private void sendWelcomeEmail(Organization organization, String plainPassword) {
        String adminName = organization.getOrganizationAdminName();
        String adminEmail = organization.getOrganizationAdminEmail();
        String orgAdminUrl = "https://flowofenglish.thechippersage.com/admin"; // Replace with actual URL
        String superAdminEmail = "support@thechippersage.com"; // Replace with actual Super Admin email

        String subject = "Welcome to Chippersage's Flow of English!";
        String messageText = "Hello " + adminName + ",\n\n" +
                "We are thrilled to have you onboard Chippersage's Flow of English program. " +
                "We are eager to see your learners excel in speaking, writing, and reading English.\n\n" +
                "Let's go ahead and get started:\n" +
                "1. Create Cohorts. In your admin dashboard, create cohorts for different learners for different programs. " +
                "Reach out to " + superAdminEmail + " if you need help setting up cohorts and assigning learners to cohorts.\n" +
                "2. Add Learners. Add learners to your organization and assign them to different cohorts. " +
                "A learner can belong to different cohorts. You can add multiple learners all at once by using 'Add Bulk Learners'.\n" +
                "3. Reports. Under Reports, you can view the progress of the learners as they start their learning journey in the assigned program.\n\n" +
                "To get started, login to your dashboard with the following credentials:\n" +
                "User ID: " + adminEmail + "\n" +
                "Password: " + plainPassword + "\n" +
                "Organization Dashboard: " + orgAdminUrl + "\n\n" +
                "If you have any questions or need assistance, please feel free to reach out to " + superAdminEmail + ".\n\n" +
                "Best regards,\n" +
                "Team Chippersage";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(adminEmail);
        message.setSubject(subject);
        message.setText(messageText);
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

    public List<Program> getProgramsByOrganizationId(String organizationId) {
        return cohortProgramRepository.findProgramsByOrganizationId(organizationId);
    }
    
    
    public List<ProgramResponseDTO> getProgramsWithCohorts(String organizationId) {
        List<CohortProgram> cohortPrograms = cohortProgramRepository.findCohortsByOrganizationId(organizationId);

        Map<String, ProgramResponseDTO> programMap = new LinkedHashMap<>();

        for (CohortProgram cohortProgram : cohortPrograms) {
            // Extract program and cohort details
            Program program = cohortProgram.getProgram();
            Cohort cohort = cohortProgram.getCohort();

            // Check if the program is already in the map
            ProgramResponseDTO programResponse = programMap.computeIfAbsent(
                program.getProgramId(),
                id -> {
                    ProgramResponseDTO dto = new ProgramResponseDTO();
                    dto.setProgramId(program.getProgramId());
                    dto.setProgramName(program.getProgramName());
                    dto.setProgramDesc(program.getProgramDesc());
                    dto.setCohorts(new ArrayList<>());
                    return dto;
                }
            );

            // Add the cohort to the program
            CohortDTO cohortDTO = new CohortDTO();
            cohortDTO.setCohortId(cohort.getCohortId());
            cohortDTO.setCohortName(cohort.getCohortName());
            programResponse.getCohorts().add(cohortDTO);
        }

        // Convert the map to a list of ProgramResponseDTO
        return new ArrayList<>(programMap.values());
    }

}
