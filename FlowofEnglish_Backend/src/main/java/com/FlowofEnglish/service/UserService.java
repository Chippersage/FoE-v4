package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.model.User;
import com.opencsv.CSVReader;

import java.util.List;
import java.util.Optional;


public interface UserService {
    List<UserDTO> getAllUsers();
    Optional<User> findByUserId(String userId);
    Optional<UserDTO> getUserById(String userId);
    List<UserDTO> getUsersByOrganizationId(String organizationId);
    User createUser(User user);
    User updateUser(String userId, User user);
    String deleteUser(String userId);
    String deleteUsers(List<String> userIds);
	UserDTO getUserDetailsWithProgram(String userId);
	String getCohortIdByUserId(String userId);
	
	List<User> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages);
    boolean verifyPassword(String plainPassword, String encodedPassword);
	boolean resetPassword(String userId, String newPassword);
    
}
