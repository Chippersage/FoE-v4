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
import com.FlowofEnglish.dto.UsercreateDTO;
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
        userDTO.setUserType(user.getUserType());
        
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
    public User createUser(UsercreateDTO userDTO) {
        User user = userDTO.getUser();
        String cohortId = userDTO.getCohortId();
        String plainPassword = DEFAULT_PASSWORD;
        
        user.setUserPassword(passwordEncoder.encode(plainPassword));
        
        User savedUser = userRepository.save(user);
        
           // Handle UserCohortMapping creation
        Cohort cohort = cohortRepository.findById(cohortId) 
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found with ID: " + cohortId));

        UserCohortMapping userCohortMapping = new UserCohortMapping();
        userCohortMapping.setUser(savedUser);
        userCohortMapping.setCohort(cohort);
        userCohortMapping.setLeaderboardScore(0); 
        userCohortMapping.setUuid(UUID.randomUUID().toString());

        // Save the UserCohortMapping to the repository
        userCohortMappingRepository.save(userCohortMapping);
        
        // If the email is present, send credentials to user
        sendWelcomeEmail(savedUser, plainPassword);
        
        return savedUser;
    }

   
    @Override
    public List<User> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages) {
        List<User> usersToCreate = new ArrayList<>();
        List<UserCohortMapping> userCohortMappingsToCreate = new ArrayList<>();
        Set<String> userIdSet = new HashSet<>();
        String[] headerRow;
        String[] line;

        try {
            // Read header row to map columns dynamically
            headerRow = csvReader.readNext();
            if (headerRow == null) {
                throw new IllegalArgumentException("CSV file is empty or missing header row.");
            }

            // Map column indices to field names
            Map<String, Integer> columnIndexMap = new HashMap<>();
            for (int i = 0; i < headerRow.length; i++) {
                columnIndexMap.put(headerRow[i].trim().toLowerCase(), i);
            }

            // Check for required columns
            List<String> requiredColumns = List.of("userid", "username", "usertype", "organizationid", "cohortid" );
            for (String col : requiredColumns) {
                if (!columnIndexMap.containsKey(col.toLowerCase())) {
                    errorMessages.add("Missing required column: " + col);
                    return usersToCreate;  // Exit early due to missing headers
                }
            }

            while ((line = csvReader.readNext()) != null) {
            	String userId = line[columnIndexMap.get("userid")];

                
             // Check if userId already exists in the Same CSV batch
                if (userIdSet.contains(userId)) {
                    errorMessages.add("Duplicate userId " + userId + " found in CSV. This user will not be created.");
                    continue;

                }
                userIdSet.add(userId); 

                // Check if userId already exists in the database
                if (userRepository.existsById(userId)) {
                    errorMessages.add("UserID: " + userId + " already exists in the database. Skipping.");
                    continue; 
                }

                try {
                    User user = new User();
                    user.setUserId(userId);
                    user.setUserName(line[columnIndexMap.get("username")]);
                    user.setUserType(line[columnIndexMap.get("usertype")]);
                    user.setUuid(UUID.randomUUID().toString());
                    user.setUserPassword(passwordEncoder.encode(DEFAULT_PASSWORD));

                    user.setUserEmail(columnIndexMap.containsKey("useremail") ? line[columnIndexMap.get("useremail")] : null);
                    user.setUserPhoneNumber(columnIndexMap.containsKey("userphonenumber") ? line[columnIndexMap.get("userphonenumber")] : null);
                    user.setUserAddress(columnIndexMap.containsKey("useraddress") ? line[columnIndexMap.get("useraddress")] : null);

                
                    // Fetch organization by ID
                    String organizationId = line[columnIndexMap.get("organizationid")];
                    Organization organization = organizationRepository.findById(organizationId)
                            .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " + organizationId ));
                    user.setOrganization(organization);
                    
                // Add user to the list for bulk saving
                usersToCreate.add(user);
                
             // Handle UserCohortMapping
                String cohortId = line[columnIndexMap.get("cohortid")];
                Cohort cohort = cohortRepository.findById(cohortId)
                        .orElseThrow(() -> new IllegalArgumentException("Cohort not found with ID: " + cohortId));

             // Check for existing UserCohortMapping before creating a new one
                if (userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(userId, cohortId)) {
                    errorMessages.add("UserID " + userId + " is already mapped to CohortID " + cohortId + ". Skipping this mapping.");
                    continue;
                }
                
                // Create the UserCohortMapping
                
                UserCohortMapping userCohortMapping = new UserCohortMapping();
                userCohortMapping.setUser(user);
                userCohortMapping.setCohort(cohort);
                userCohortMapping.setLeaderboardScore(0);
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

         
            // Send welcome email for each new user
            for (User savedUser : savedUsers) {
                if (savedUser.getUserEmail() != null && !savedUser.getUserEmail().isEmpty()) {
                    sendWelcomeEmail(savedUser, DEFAULT_PASSWORD);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV: " + e.getMessage(), e);
        }

        return usersToCreate; 
    }

    // Helper function to send welcome email
    private void sendWelcomeEmail(User user, String plainPassword) {
        try {
            UserCohortMapping userCohortMapping = userCohortMappingRepository.findByUserUserId(user.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Cohort not found for userId: " + user.getUserId()));

            Cohort cohort = userCohortMapping.getCohort();
            CohortProgram cohortProgram = cohortProgramRepository.findByCohortCohortId(cohort.getCohortId())
                    .orElseThrow(() -> new IllegalArgumentException("Program not found for cohortId: " + cohort.getCohortId()));

            Organization organization = user.getOrganization();
            emailService.sendUserCreationEmail(
                    user.getUserEmail(),
                    user.getUserName(),
                    user.getUserId(),
                    plainPassword,
                    cohortProgram.getProgram().getProgramName(),
                    cohortProgram.getProgram().getProgramId(),
                    cohort.getCohortName(),
                    organization.getOrganizationAdminEmail(),
                    organization.getOrganizationName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send welcome email for user: " + user.getUserId() + ", error: " + e.getMessage());
        }
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
                    user.setUserType(updatedUser.getUserType());
                 // Check if the password is being updated
                    if (updatedUser.getUserPassword() != null && !updatedUser.getUserPassword().isEmpty()) {
                        user.setUserPassword(passwordEncoder.encode(updatedUser.getUserPassword()));
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
            user.setUserPassword(encodedPassword);  
            userRepository.save(user);  
            return true;
        } else {
            return false;  
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
        dto.setUserType(user.getUserType());
        dto.setOrganization(convertOrganizationToDTO(user.getOrganization()));

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
