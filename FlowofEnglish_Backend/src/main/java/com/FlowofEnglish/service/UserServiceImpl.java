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
    
    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<UserDTO> getUserById(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO);
    }

    @Override
    public List<UserDTO> getUsersByOrganizationId(String organizationId) {
        return userRepository.findByOrganizationOrganizationId(organizationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public User createUser(User user) {
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
            while ((line = csvReader.readNext()) != null) {
                // Assuming CSV format: userId, userEmail, userName, userAddress, userPhoneNumber, userPassword, userType, organizationId
                User user = new User();
                user.setUserId(line[0]);
                user.setUserEmail(line[1]);
                user.setUserName(line[2]);
                user.setUserAddress(line[3]);
                user.setUserPhoneNumber(line[4]);
                user.setUserPassword(line[5]); // Ideally, password would be hashed
                user.setUserType(line[6]);
                user.setUuid(UUID.randomUUID().toString());

                // Fetch the organization by organizationId (line[7])
                Organization organization = organizationRepository.findById(line[7])
                        .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
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
                    user.setUserPassword(updatedUser.getUserPassword()); // Store password as is
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
    public Optional<User> findByUserId(String userId) {
        return userRepository.findById(userId);
    }


    @Override
    public boolean verifyPassword(String providedPassword, String storedPassword) {
        return providedPassword.equals(storedPassword);
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
}
