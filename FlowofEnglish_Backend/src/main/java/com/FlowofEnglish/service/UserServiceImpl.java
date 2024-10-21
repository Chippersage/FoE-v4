package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Cohort;
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
import com.FlowofEnglish.repository.CohortRepository;
import com.FlowofEnglish.repository.OrganizationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CohortService cohortService; 

    @Autowired
    private ProgramService programService; 

    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository; 

    @Autowired
    private CohortProgramRepository cohortProgramRepository;
    
    @Autowired
    private UserCohortMappingService userCohortMappingService;

    
    @Autowired
    private CohortRepository cohortRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

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

    
 // New method to fetch user details based on selected program
    @Override
    public UserDTO getUserDetailsWithProgram(String userId, String programId) {
        UserDTO userDTO = new UserDTO();
        User user = findByUserId(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        
     // Set basic user details
        userDTO.setUserId(user.getUserId());
        userDTO.setUserName(user.getUserName());
        userDTO.setUserEmail(user.getUserEmail());
        userDTO.setUserPhoneNumber(user.getUserPhoneNumber());
        userDTO.setUserAddress(user.getUserAddress());
        
        // Set organization details in UserDTO
        userDTO.setOrganization(convertOrganizationToDTO(user.getOrganization()));
        
        // Fetch UserCohortMapping based on userId and programId
        Optional<UserCohortMapping> userCohortMappingOpt = userCohortMappingService.findByUserUserIdAndProgramId(userId, programId);
        
        if (userCohortMappingOpt.isPresent()) {
            UserCohortMapping userCohortMapping = userCohortMappingOpt.get();
            
         // Set cohort details in CohortDTO
            CohortDTO cohortDTO = new CohortDTO();
            cohortDTO.setCohortId(userCohortMapping.getCohort().getCohortId());
            cohortDTO.setCohortName(userCohortMapping.getCohort().getCohortName());
            userDTO.setCohort(cohortDTO);
            
         // Fetch the program from CohortProgramRepository
            Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository.findByCohortCohortId(userCohortMapping.getCohort().getCohortId());

            if (cohortProgramOpt.isPresent()) {
                CohortProgram cohortProgram = cohortProgramOpt.get();

                // Set program details in ProgramDTO
                ProgramDTO programDTO = new ProgramDTO();
                programDTO.setProgramId(cohortProgram.getProgram().getProgramId());
                programDTO.setProgramName(cohortProgram.getProgram().getProgramName());
                programDTO.setProgramDesc(cohortProgram.getProgram().getProgramDesc());
                programDTO.setStagesCount(cohortProgram.getProgram().getStages());
                programDTO.setUnitCount(cohortProgram.getProgram().getUnitCount());
                userDTO.setProgram(programDTO);
            } else {
                throw new IllegalArgumentException("Program not found for cohortId: " + userCohortMapping.getCohort().getCohortId());
            }
        } else {
            throw new IllegalArgumentException("UserCohortMapping not found for userId: " + userId + " and programId: " + programId);
        }

        return userDTO;
    }

    
    @Override
    public User createUser(User user) {
        String plainPassword = DEFAULT_PASSWORD;
        user.setUserPassword(passwordEncoder.encode(plainPassword));  // Hash the password for DB storage
        
        User savedUser = userRepository.save(user);
        
        // If the email is present, send credentials to user
        if (user.getUserEmail() != null && !user.getUserEmail().isEmpty()) {
            emailService.sendEmail(user.getUserEmail(), 
                "Your Credentials",
                "UserID: " + user.getUserId() + "\nPassword: " + plainPassword);
        }
        
        return savedUser;
    }

    
    
    
    @Override
    public List<User> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages) {
        List<User> usersToCreate = new ArrayList<>();
        List<UserCohortMapping> userCohortMappingsToCreate = new ArrayList<>();
        Set<String> userIdSet = new HashSet<>();
        String[] line;

        try {
            // Read header row to skip it
            csvReader.readNext(); 
            
            while ((line = csvReader.readNext()) != null) {
                String userId = line[0];
                
             // Check if userId already exists in the Same CSV batch
                if (userIdSet.contains(userId)) {
                    errorMessages.add("Duplicate userId " + userId + " found in CSV. This user will not be created.");
                    continue;

                }
                userIdSet.add(userId); // Add userId to the set

                // Check if userId already exists in the database
                if (userRepository.existsById(userId)) {
                    errorMessages.add("UserID: " + userId + " already exists in the database. Skipping.");
                    continue; // Skip creating this user and move to the next one
                }

                // Proceed to create the user
                User user = new User();
                user.setUserId(userId);
                user.setUserEmail(line[1]);
                user.setUserName(line[2]);
                user.setUserAddress(line[3]);
                user.setUserPhoneNumber(line[4]);
                String plainPassword = DEFAULT_PASSWORD;
                user.setUserPassword(passwordEncoder.encode(plainPassword)); // Set the default password
                user.setUserType(line[5]);
                user.setUuid(UUID.randomUUID().toString());

                // Find the organization by its ID
                try {
                    // Fetch organization by ID
                    Organization organization = organizationRepository.findById(line[6])
                            .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " ));
                    System.out.println("Looking up organization for ID: " + line[6]);
                    user.setOrganization(organization);
                } catch (IllegalArgumentException ex) {
                    errorMessages.add("Error for UserID " + userId + ": " + ex.getMessage());
                    continue; // Skip this user and move to the next one
                }

                // Add user to the list for bulk saving
                usersToCreate.add(user);
                
             // Now handle the cohort information (assuming cohort ID is in line[7])
                String cohortId = line[7];
                try {
                // Find the cohort by its ID
                Cohort cohort = cohortRepository.findById(cohortId)
                    .orElseThrow(() -> new IllegalArgumentException("Cohort not found with ID: " + cohortId));

                // Create the UserCohortMapping
                
                UserCohortMapping userCohortMapping = new UserCohortMapping();
                userCohortMapping.setUser(user);
                userCohortMapping.setCohort(cohort);
                userCohortMapping.setLeaderboardScore(0); // Initial score, you can set this as needed
                userCohortMapping.setUuid(UUID.randomUUID().toString());

                // Add to the list of mappings to be saved later
                userCohortMappingsToCreate.add(userCohortMapping);
            }catch (IllegalArgumentException ex) {
                errorMessages.add("Error for UserID " + userId + ": " + ex.getMessage());
                continue;
            }
        }

        // Save all new users that don't already exist
        List<User> savedUsers = userRepository.saveAll(usersToCreate);

            // Save the user-cohort mappings
            userCohortMappingRepository.saveAll(userCohortMappingsToCreate);

                
                // Send email if the email field is not null
            for (User savedUser : savedUsers) {
            	String plainPassword = DEFAULT_PASSWORD;
            	if (savedUser.getUserEmail() != null && !savedUser.getUserEmail().isEmpty()) {
                    UserCohortMapping userCohortMapping = userCohortMappingRepository.findByUserUserId(savedUser.getUserId())
                            .orElseThrow(() -> new IllegalArgumentException("Cohort not found for userId: " + savedUser.getUserId()));

                    Cohort cohort = userCohortMapping.getCohort();
                    CohortProgram cohortProgram = cohortProgramRepository.findByCohortCohortId(cohort.getCohortId())
                            .orElseThrow(() -> new IllegalArgumentException("Program not found for cohortId: " + cohort.getCohortId()));

                    Organization organization = savedUser.getOrganization();
                    emailService.sendUserCreationEmail(
                            savedUser.getUserEmail(),
                            savedUser.getUserName(),
                            savedUser.getUserId(),
                            plainPassword,
                            cohortProgram.getProgram().getProgramName(),
                            cohort.getCohortName(),
                            organization.getOrganizationAdminEmail(),
                            organization.getOrganizationName()
                    );
                }
            }
                            
         // Log the count of users in the database after insertion
            long totalUsersInDatabase = userRepository.count();
            System.out.println("Total users in the database after insertion: " + totalUsersInDatabase);

        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV: " + e.getMessage(), e);
        }

        return usersToCreate; // Return only successfully created users
    }

    @Override
    public String getCohortIdByUserId(String userId) {
        return userCohortMappingRepository.findByUserUserId(userId)
                .map(userCohortMapping -> userCohortMapping.getCohort().getCohortId())
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found for userId: " + userId));
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
    public String deleteUser(String userId) {
        // First, retrieve the user to get their details before deletion
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            userRepository.deleteById(userId);  // Delete the user
            
            // Return a message with the user's name and ID
            return "User '" + user.getUserName() + "' with ID: " + user.getUserId() + " has been deleted.";
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }

    
    @Override
    public String deleteUsers(List<String> userIds) {
        List<User> deletedUsers = new ArrayList<>();
        for (String userId : userIds) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                deletedUsers.add(user);
                userRepository.deleteById(userId);
            }
        }
        
        int deletedCount = deletedUsers.size();
        
        if (deletedCount == 1) {
            User deletedUser = deletedUsers.get(0);
            return "User '" + deletedUser.getUserName() + "' with ID: " + deletedUser.getUserId() + " has been deleted.";
        } else if (deletedCount > 1) {
            StringBuilder message = new StringBuilder();
            message.append(deletedCount + " users have been deleted. The following users were deleted:\n");
            for (User deletedUser : deletedUsers) {
                message.append("User Name: " + deletedUser.getUserName() + ", User ID: " + deletedUser.getUserId() + "\n");
            }
            return message.toString();
        } else {
            return "No users were deleted.";
        }
    }


    @Override
    public boolean resetPassword(String userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setUserPassword(encodedPassword);  // Update the password
            userRepository.save(user);  // Save the user with updated password
            return true;
        } else {
            return false;  // User not found
        }
    }
    
    public boolean verifyPassword(String plainPassword, String encodedPassword) {
        return passwordEncoder.matches(plainPassword, encodedPassword);
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
    
}
