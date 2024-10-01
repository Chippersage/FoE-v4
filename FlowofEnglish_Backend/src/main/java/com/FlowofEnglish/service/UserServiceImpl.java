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
import com.FlowofEnglish.repository.UserCohortMappingRepository;
import com.FlowofEnglish.repository.CohortProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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
