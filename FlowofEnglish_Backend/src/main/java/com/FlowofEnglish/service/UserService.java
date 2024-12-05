package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.dto.UserGetDTO;
import com.FlowofEnglish.dto.UsercreateDTO;
import com.FlowofEnglish.model.User;
import com.opencsv.CSVReader;

import java.util.List;
import java.util.Map;
import java.util.Optional;


public interface UserService {
    List<UserGetDTO> getAllUsers();
    Optional<User> findByUserId(String userId);
    Optional<UserGetDTO> getUserById(String userId);
    UserDTO getUserDetailsWithProgram(String userId, String programId);
    List<UserGetDTO> getUsersByOrganizationId(String organizationId);
    User createUser(UsercreateDTO userDTO);
    User updateUser(String userId, User user);
    String deleteUser(String userId);
    String deleteUsers(List<String> userIds);
	UserDTO getUserDetailsWithProgram(String userId);
	String getCohortIdByUserId(String userId);
	List<String> getCohortsByUserId(String userId);
	//List<User> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages);
	Map<String, Object> parseAndCreateUsersFromCsv(CSVReader csvReader, List<String> errorMessages, List<String> warnings);
    boolean verifyPassword(String plainPassword, String encodedPassword);
	boolean resetPassword(String userId, String newPassword);
    
}
