
package com.FlowofEnglish.service;

import com.FlowofEnglish.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {

    List<User> getAllUsers();

    Optional<User> getUserById(String userId);

    List<User> getUsersByOrganizationId(String organizationId);

    User createUser(User user);

    List<User> createUsers(List<User> users);

    User updateUser(String userId, User user);

    void deleteUser(String userId);

    User findByUserId(String userId); // New method to find user by userId

    boolean verifyPassword(String providedPassword, String storedPassword); // New method to verify password
}
