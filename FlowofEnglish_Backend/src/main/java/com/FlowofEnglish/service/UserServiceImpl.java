package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.CohortProgram;
import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserCohortMapping;
import com.FlowofEnglish.model.UserType;
import com.FlowofEnglish.dto.CohortDTO;
import com.FlowofEnglish.dto.OrganizationDTO;
import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.dto.UserGetDTO;
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
    public List<UserGetDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<User> findByUserId(String userId) {
        return userRepository.findById(userId);
    }
    
    @Override
    public Optional<UserGetDTO> getUserById(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Optional.of(convertToUserDTO(user));
        } else {
            return Optional.empty();
        }
    }
    
    
    @Override
    public List<UserGetDTO> getUsersByOrganizationId(String organizationId) {
        return userRepository.findByOrganizationOrganizationId(organizationId).stream()
                .map(this::convertToUserDTO)
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

     // Validate userType
        try {
            UserType.fromString(user.getUserType()); // Throws exception if invalid
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid userType: " + user.getUserType() + ". Allowed values are 'learner' or 'mentor'.");
        }
        
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
        
     // Fetch program details from CohortProgram
        List<String> programNames = new ArrayList<>();
        List<String> cohortNames = new ArrayList<>();
        cohortProgramRepository.findByCohortCohortId(cohort.getCohortId())
                .ifPresent(cohortProgram -> {
                    programNames.add(cohortProgram.getProgram().getProgramName());
                    cohortNames.add(cohort.getCohortName());
                });

     // If the email is present, send credentials to the user
        if (user.getUserEmail() != null && !user.getUserEmail().isEmpty()) {
            sendWelcomeEmail(savedUser, plainPassword, programNames, cohortNames);
        }

        return savedUser;
    }
   
    @Override
    public Map<String, Object> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages, List<String> warnings) {
        List<User> usersToCreate = new ArrayList<>();
        List<UserCohortMapping> userCohortMappingsToCreate = new ArrayList<>();
        Map<String, User> createdUsers = new HashMap<>();
        Set<String> userIdSet = new HashSet<>();
        String[] headerRow;
        String[] line;
        int userCreatedCount = 0;
        int userCohortMappingCreatedCount = 0;

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
                    return Map.of("createdUserCount", userCreatedCount, "createdUserCohortMappingCount", userCohortMappingCreatedCount, "errorCount", errorMessages.size(), "warningCount", warnings.size());
                }
            }

            while ((line = csvReader.readNext()) != null) {
            	String userId = line[columnIndexMap.get("userid")];
            	String cohortId = line[columnIndexMap.get("cohortid")];

            	// Check if userId exists in the same batch
                if (userIdSet.contains(userId)) {
                    errorMessages.add("Duplicate userId " + userId + " found in CSV. This user will not be created.");
                    continue; // Skip processing this line
                }
                userIdSet.add(userId);

                // Check if userId already exists in the database
                if (userRepository.existsById(userId)) {
                    errorMessages.add("UserID: " + userId + " already exists in the database. Skipping.");
                    continue; // Skip processing this line
                }
                
            	
            	// Check if userId exists in the same batch or database
            	try {
                User user = createdUsers.get(userId);
                if (user == null)  {
                    user = new User();
                    user.setUserId(userId);
                    user.setUserName(line[columnIndexMap.get("username")]);
                 // Validate userType
                    String userType = line[columnIndexMap.get("usertype")].toLowerCase();
                    if (!userType.equals("learner") && !userType.equals("mentor")) {
                        errorMessages.add("Invalid userType for UserID " + userId + ": " + userType + ". Allowed values are 'learner' or 'mentor'.");
                        continue;
                    }
                    user.setUserType(userType);
                    user.setUuid(UUID.randomUUID().toString());
                    user.setUserPassword(passwordEncoder.encode(DEFAULT_PASSWORD));

                    String userEmail = columnIndexMap.containsKey("useremail") ? line[columnIndexMap.get("useremail")] : null;
                 // Validate only non-empty emails
                    if (userEmail != null && !userEmail.isEmpty() && !isValidEmail(userEmail)) {
                    	warnings.add("Invalid email for UserID " + userId + ": " + userEmail);
                        userEmail = null; // Reset invalid email to null
                    }
                    user.setUserEmail(userEmail);

                    String userPhone = columnIndexMap.containsKey("userphonenumber") ? line[columnIndexMap.get("userphonenumber")] : null;
                    if (userPhone != null && !isValidPhoneNumber(userPhone)) {
                    	warnings.add("Invalid phone number for UserID " + userId + ": " + userPhone);
                        userPhone = null; // Reset invalid phone number to null
                    }
                    user.setUserPhoneNumber(userPhone);
                    user.setUserAddress(columnIndexMap.containsKey("useraddress") ? line[columnIndexMap.get("useraddress")] : null);

                
                    // Fetch organization by ID
                    String organizationId = line[columnIndexMap.get("organizationid")];
                    Organization organization = organizationRepository.findById(organizationId)
                            .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " + organizationId ));
                    user.setOrganization(organization);
                    
                // Add user to the list for bulk saving
                usersToCreate.add(user);
                createdUsers.put(userId, user);
                userCreatedCount++;
                }
            } catch (Exception ex) {
                errorMessages.add("Error creating UserID " + userId + ": " + ex.getMessage());
                continue;
            }
    

                try {
                    Cohort cohort = cohortRepository.findById(cohortId)
                    		.orElseThrow(() -> new IllegalArgumentException("Cohort not found with ID: " + cohortId));

             // Check for existing UserCohortMapping before creating a new one
                if (userCohortMappingRepository.existsByUser_UserIdAndCohort_CohortId(userId, cohortId)) {
                    errorMessages.add("UserID " + userId + " is already mapped to CohortID " + cohortId + ". Skipping this mapping.");
                    continue;
                }
                
                // Create the UserCohortMapping
                User user = createdUsers.get(userId);
                UserCohortMapping userCohortMapping = new UserCohortMapping();
                userCohortMapping.setUser(user);
                userCohortMapping.setCohort(cohort);
                userCohortMapping.setLeaderboardScore(0);
                userCohortMapping.setUuid(UUID.randomUUID().toString());

                // Add to the list of mappings to be saved later
                userCohortMappingsToCreate.add(userCohortMapping);
                userCohortMappingCreatedCount++;
            }catch (Exception ex) {
                errorMessages.add("Error mapping UserID " + userId + " to CohortID " + cohortId + ": " + ex.getMessage());
            }
        }

        // Save all new users that don't already exist
        List<User> savedUsers = userRepository.saveAll(usersToCreate);

            // Save the user-cohort mappings
            userCohortMappingRepository.saveAll(userCohortMappingsToCreate);

         
         // Send welcome email for each new user
            for (User savedUser : savedUsers) {
                if (savedUser.getUserEmail() != null && !savedUser.getUserEmail().isEmpty()) {
                    // Collect all assigned cohorts and programs for the user
                    List<UserCohortMapping> userCohortMappings = userCohortMappingRepository.findAllByUserUserId(savedUser.getUserId());
                    List<String> programNames = new ArrayList<>();
                    List<String> cohortNames = new ArrayList<>();
                    
                    for (UserCohortMapping mapping : userCohortMappings) {
                        Cohort cohort = mapping.getCohort();
                        cohortNames.add(cohort.getCohortName());

                        // Fetch program details from CohortProgram
                        cohortProgramRepository.findByCohortCohortId(cohort.getCohortId()).ifPresent(cohortProgram -> 
                            programNames.add(cohortProgram.getProgram().getProgramName())
                        );
                    }

                    sendWelcomeEmail(savedUser, DEFAULT_PASSWORD, programNames, cohortNames);
                }
            }
            return Map.of(
                    "createdUserCount", userCreatedCount,
                    "createdUserCohortMappingCount", userCohortMappingCreatedCount,
                    "errorCount", errorMessages.size(),
                    "warningCount", warnings.size(),
                    "errors", errorMessages,
                    "warnings", warnings
            );
        } catch (Exception e) {
            throw new RuntimeException("Error parsing CSV: " + e.getMessage(), e);
        }
    }

    // Helper function to send welcome email
    private void sendWelcomeEmail(User user, String plainPassword, List<String> programNames, List<String> cohortNames) {
    	try {
            Organization organization = user.getOrganization();
            emailService.sendUserCreationEmail(
                    user.getUserEmail(),
                    user.getUserName(),
                    user.getUserId(),
                    plainPassword,
                    programNames,
                    cohortNames,
                    organization.getOrganizationAdminEmail(),
                    organization.getOrganizationName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send welcome email for user: " + user.getUserId() + ", error: " + e.getMessage());
        }
    }
           
    private boolean isValidEmail(String email) {
    	// Return true for null or empty strings
        if (email == null || email.isEmpty()) {
            return true; // No error for empty emails
        }
        return email != null && email.matches("^(?!.*\\.\\.)[\\w._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    }

    private boolean isValidPhoneNumber(String phoneNumber) {
        return phoneNumber != null && phoneNumber.matches("^[6-9]\\d{9}$");
    }

    @Override
    public String getCohortIdByUserId(String userId) {
        return userCohortMappingRepository.findByUserUserId(userId)
                .map(userCohortMapping -> userCohortMapping.getCohort().getCohortId())
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found for userId: " + userId));
    }
    
    @Override
    public List<String> getCohortsByUserId(String userId) {
        List<UserCohortMapping> userCohortMappings = userCohortMappingRepository.findAllByUserUserId(userId);
        if (userCohortMappings.isEmpty()) {
            throw new IllegalArgumentException("No cohorts found for userId: " + userId);
        }
        return userCohortMappings.stream()
                .map(mapping -> mapping.getCohort().getCohortId())
                .collect(Collectors.toList());
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
    
    private UserGetDTO convertToUserDTO(User user) {
        UserGetDTO dto = new UserGetDTO();
        dto.setUserId(user.getUserId());
        dto.setUserAddress(user.getUserAddress());
        dto.setUserEmail(user.getUserEmail());
        dto.setUserName(user.getUserName());
        dto.setUserPhoneNumber(user.getUserPhoneNumber());
        dto.setUserType(user.getUserType());
        
        // Set organization
        if (user.getOrganization() != null) {
            dto.setOrganization(convertOrganizationToDTO(user.getOrganization()));
        }

        // Get all UserCohortMappings for this user
        List<UserCohortMapping> userCohortMappings = userCohortMappingRepository.findAllByUserUserId(user.getUserId());
        
        if (!userCohortMappings.isEmpty()) {
            // Get the active or most recent cohort mapping
            // You might want to add a status field to UserCohortMapping to track active/inactive
            UserCohortMapping primaryMapping = userCohortMappings.get(0);
            
            // Set primary cohort
            Cohort primaryCohort = primaryMapping.getCohort();
            if (primaryCohort != null) {
                CohortDTO cohortDTO = cohortService.convertToDTO(primaryCohort);
                dto.setCohort(cohortDTO);

                // Get program for primary cohort
                Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository
                    .findByCohortCohortId(primaryCohort.getCohortId());
                
                if (cohortProgramOpt.isPresent()) {
                    ProgramDTO programDTO = programService.convertToDTO(cohortProgramOpt.get().getProgram());
                    dto.setProgram(programDTO);
                }
            }

            // Add all cohorts and their programs
            List<CohortDTO> allCohorts = new ArrayList<>();
            Set<ProgramDTO> allPrograms = new HashSet<>();

            
            for (UserCohortMapping mapping : userCohortMappings) {
                Cohort cohort = mapping.getCohort();
                if (cohort != null) {
                    CohortDTO cohortDTO = cohortService.convertToDTO(cohort);
                    allCohorts.add(cohortDTO);

                    // Get program for this cohort
                    Optional<CohortProgram> cohortProgramOpt = cohortProgramRepository
                        .findByCohortCohortId(cohort.getCohortId());
                    
                    if (cohortProgramOpt.isPresent()) {
                        ProgramDTO programDTO = programService.convertToDTO(cohortProgramOpt.get().getProgram());
                        allPrograms.add(programDTO);
                    }
                }
            }
            
            dto.setAllCohorts(allCohorts);
            dto.setAllPrograms(new ArrayList<>(allPrograms));
        }

        return dto;
    }

    
}
