package com.FlowofEnglish.service;

import com.FlowofEnglish.model.CohortProgram;
import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.dto.CohortDTO;
import com.FlowofEnglish.dto.OrganizationDTO;
import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.repository.UserRepository;
import com.opencsv.CSVReader;
import com.FlowofEnglish.repository.UserCohortMappingRepository;
import com.FlowofEnglish.repository.CohortProgramRepository;
import com.FlowofEnglish.repository.OrganizationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CohortService cohortService; // Autowire CohortService

    @Autowired
    private ProgramService programService; // Autowire ProgramService

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository; // Autowire UserCohortMappingRepository

    @Autowired
    private CohortProgramRepository cohortProgramRepository; // Autowire CohortProgramRepository

    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    // The default password that every new user is assigned
    private final String DEFAULT_PASSWORD = "Welcome123";
    
    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<User> findByUserId(String userId) {
        return userRepository.findById(userId);
    }
    
    @Override
    public Optional<UserDTO> getUserById(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (isDefaultPassword(user)) {
                // Redirect to reset password page or add an indicator in the response
                throw new RuntimeException("Redirect to reset password");
            }
            return Optional.of(convertToDTO(user));
        } else {
            return Optional.empty();
        }
    }
    
    
    @Override
    public List<UserDTO> getUsersByOrganizationId(String organizationId) {
        return userRepository.findByOrganizationOrganizationId(organizationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public User createUser(User user) {
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return userRepository.save(user);
    }
    
    @Override
    public List<User> createUsers(List<User> users) {
        return userRepository.saveAll(users);
    }
    
    @Override
    public List<User> parseAndCreateUsersFromCsv(CSVReader csvReader) {
        List<User> users = new ArrayList<>();
        String[] line;
        try {
        	// Read header row to skip it
            csvReader.readNext(); // Skip header row
            while ((line = csvReader.readNext()) != null) {
                User user = new User();
                user.setUserId(line[0]);
                user.setUserEmail(line[1]);
                user.setUserName(line[2]);
                user.setUserAddress(line[3]);
                user.setUserPhoneNumber(line[4]);
                user.setUserPassword(passwordEncoder.encode(DEFAULT_PASSWORD)); // Set the default password
                user.setUserType(line[5]);
                user.setUuid(UUID.randomUUID().toString());

                Organization organization = organizationRepository.findById(line[6])
                		.orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " ));
                System.out.println("Looking up organization for ID: " + line[6]);

                user.setOrganization(organization);

                users.add(user);
            }

            return userRepository.saveAll(users);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV: " + e.getMessage(), e);
        }
    }

    @Override
    public User updateUser(String userId, User updatedUser) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setUserAddress(updatedUser.getUserAddress());
                    user.setUserEmail(updatedUser.getUserEmail());
                    user.setUserName(updatedUser.getUserName());
                    user.setUserPhoneNumber(updatedUser.getUserPhoneNumber());
                 // Check if the password is being updated
                    if (updatedUser.getUserPassword() != null && !updatedUser.getUserPassword().isEmpty()) {
                        user.setUserPassword(passwordEncoder.encode(updatedUser.getUserPassword())); // Encode new password
                    }
                    user.setOrganization(updatedUser.getOrganization());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }
    
    @Override
    public Optional<User> authenticateUser(String userId, String password) {
        return userRepository.findById(userId).filter(user -> {
            boolean isAuthenticated = verifyPassword(password, user.getUserPassword());
            if (isAuthenticated && isDefaultPassword(user)) {
                throw new IllegalStateException("Please reset your password.");
            }
            return isAuthenticated;
        });
    }
    
    public void resetPassword(String userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setUserPassword(passwordEncoder.encode(newPassword)); // Encode new password
        userRepository.save(user);
    }

  
    @Override
    public UserDTO getUserDetailsWithProgram(String userId) {
        // Fetch the UserCohortMapping
        UserCohortMapping userCohortMapping = userCohortMappingRepository.findByUserUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("UserCohortMapping not found"));

        // Fetch the CohortProgram based on cohortId from UserCohortMapping
        CohortProgram cohortProgram = cohortProgramRepository.findByCohortCohortId(userCohortMapping.getCohort().getCohortId())
                .orElseThrow(() -> new IllegalArgumentException("CohortProgram not found"));

        // Convert User, Cohort, and Program to DTO
        UserDTO userDTO = convertToDTO(userCohortMapping.getUser());
        CohortDTO cohortDTO = cohortService.convertToDTO(userCohortMapping.getCohort());
        ProgramDTO programDTO = programService.convertToDTO(cohortProgram.getProgram());

        // Set cohort and program in UserDTO
        userDTO.setCohort(cohortDTO);
        userDTO.setProgram(programDTO);

        return userDTO;
    }
    

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUserAddress(user.getUserAddress());
        dto.setUserEmail(user.getUserEmail());
        dto.setUserName(user.getUserName());
        dto.setUserPhoneNumber(user.getUserPhoneNumber());
        dto.setOrganization(convertOrganizationToDTO(user.getOrganization()));
        // Cohort and Program will be set in getUserDetailsWithProgram()
        return dto;
    }

    private OrganizationDTO convertOrganizationToDTO(Organization organization) {
        OrganizationDTO dto = new OrganizationDTO();
        dto.setOrganizationId(organization.getOrganizationId());
        dto.setOrganizationName(organization.getOrganizationName());
        dto.setOrganizationAdminName(organization.getOrganizationAdminName());
        dto.setOrganizationAdminEmail(organization.getOrganizationAdminEmail());
        dto.setOrganizationAdminPhone(organization.getOrganizationAdminPhone());
        return dto;
    }
    
    @Override
    public boolean verifyPassword(String providedPassword, String storedPassword) {
        return passwordEncoder.matches(providedPassword, storedPassword);
    }


    public boolean isDefaultPassword(User user) {
        return passwordEncoder.matches(DEFAULT_PASSWORD, user.getUserPassword());
    }
    
}
