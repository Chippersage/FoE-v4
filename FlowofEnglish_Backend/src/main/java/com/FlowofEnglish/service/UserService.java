package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.model.User;

import java.util.List;
import java.util.Optional;


public interface UserService {
    List<UserDTO> getAllUsers();
    Optional<User> findByUserId(String userId);
    Optional<UserDTO> getUserById(String userId);
    List<UserDTO> getUsersByOrganizationId(String organizationId);
    
//    List<User> getAllUsers();
//    Optional<User> getUserById(String userId);
//    List<User> getUsersByOrganizationId(String organizationId);
    
    User createUser(User user);
    List<User> createUsers(List<User> users);
    User updateUser(String userId, User user);
    void deleteUser(String userId);
    //User findByUserId(String userId);
    boolean verifyPassword(String providedPassword, String storedPassword);
	UserDTO getUserDetailsWithProgram(String userId);
    
//  Optional<UserDTO> getUserDetails(String userId);

}


    
//    UserDTO createUser(UserDTO userDTO);
//
//    List<UserDTO> createUsers(List<UserDTO> userDTOs);
//
//    UserDTO updateUser(String userId, UserDTO userDTO);
//
//    void deleteUser(String userId);
//
//    Optional<UserDTO> findByUserId(String userId); // Updated to return Optional<UserDTO>
//
//    boolean verifyPassword(String providedPassword, String storedPassword);


