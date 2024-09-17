package com.FlowofEnglish.service;


import com.FlowofEnglish.model.User;
import com.FlowofEnglish.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    // Remove BCryptPasswordEncoder injection
    // @Autowired
    // private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public List<User> getUsersByOrganizationId(String organizationId) {
        return userRepository.findByOrganizationOrganizationId(organizationId);
    }

    @Override
    public User createUser(User user) {
    	// Encrypt password before saving
        //user.setUserPassword(bCryptPasswordEncoder.encode(user.getUserPassword())); // Encrypt password before saving
        return userRepository.save(user);
    }

    @Override
    public List<User> createUsers(List<User> users) {
//        for (User user : users) {
//            user.setUserPassword(bCryptPasswordEncoder.encode(user.getUserPassword())); // Encrypt passwords
//        }
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
                    //user.setUserPassword(bCryptPasswordEncoder.encode(updatedUser.getUserPassword())); // Encrypt password
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
    public User findByUserId(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @Override
    public boolean verifyPassword(String providedPassword, String storedPassword) {
       // return bCryptPasswordEncoder.matches(providedPassword, storedPassword);
    	return providedPassword.equals(storedPassword);
    }
}







//package com.FlowofEnglish.service;

//
//
//import com.FlowofEnglish.model.User;
//import com.FlowofEnglish.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class UserServiceImpl implements UserService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Override
//    public List<User> getAllUsers() {
//        return userRepository.findAll();
//    }
//
//    @Override
//    public Optional<User> getUserById(String userId) {
//        return userRepository.findById(userId);
//    }
//
//    @Override
//    public List<User> getUsersByOrganizationId(String organizationId) {
//        return userRepository.findByOrganizationOrganizationId(organizationId);
//    }
//
//    @Override
//    public User createUser(User user) {
//        return userRepository.save(user);
//    }
//
//    @Override
//    public List<User> createUsers(List<User> users) {
//        return userRepository.saveAll(users);
//    }
//
//    @Override
//    public User updateUser(String userId, User updatedUser) {
//        return userRepository.findById(userId)
//                .map(user -> {
//                    user.setUserAddress(updatedUser.getUserAddress());
//                    user.setUserEmail(updatedUser.getUserEmail());
//                    user.setUserName(updatedUser.getUserName());
//                    user.setUserPhoneNumber(updatedUser.getUserPhoneNumber());
//                    user.setOrganization(updatedUser.getOrganization());
//                    return userRepository.save(user);
//                })
//                .orElseThrow(() -> new IllegalArgumentException("User not found"));
//    }
//
//    @Override
//    public void deleteUser(String userId) {
//        userRepository.deleteById(userId);
//    }
//}
