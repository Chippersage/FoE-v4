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
    List<User> createUsers(List<User> users);
    User updateUser(String userId, User user);
    void deleteUser(String userId);
    boolean verifyPassword(String providedPassword, String storedPassword);
	UserDTO getUserDetailsWithProgram(String userId);
    
	List<User> parseAndCreateUsersFromCsv(CSVReader csvReader);
	
	Optional<User> authenticateUser(String userId, String password);
	
	boolean isDefaultPassword(User user);
}

//List<User> getAllUsers();
//Optional<User> getUserById(String userId);
//List<User> getUsersByOrganizationId(String organizationId);
//Optional<UserDTO> getUserDetails(String userId);
//User findByUserId(String userId);
