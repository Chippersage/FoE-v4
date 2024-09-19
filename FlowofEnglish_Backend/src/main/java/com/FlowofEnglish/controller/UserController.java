package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserDTO;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.service.TokenService;
import com.FlowofEnglish.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;
    
//    @Autowired
//    private TokenService tokenService;

    
    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organization/{organizationId}")
    public List<UserDTO> getUsersByOrganizationId(@PathVariable String organizationId) {
        return userService.getUsersByOrganizationId(organizationId);
    }
    
    @GetMapping("/{userId}/details")
    public ResponseEntity<UserDTO> getUserDetailsWithProgram(@PathVariable String userId) {
        UserDTO userDTO = userService.getUserDetailsWithProgram(userId);
        return ResponseEntity.ok(userDTO);
    }

//    @GetMapping
//    public List<User> getAllUsers() {
//        return userService.getAllUsers();
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<User> getUserById(@PathVariable String id) {
//        return userService.getUserById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    @GetMapping("/organization/{organizationId}")
//    public List<User> getUsersByOrganizationId(@PathVariable String organizationId) {
//        return userService.getUsersByOrganizationId(organizationId);
//    }

    @PostMapping("/create")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/bulkcreate")
    public List<User> createUsers(@RequestBody List<User> users) {
        return userService.createUsers(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
 // New Login Method
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String password = payload.get("password");
        // Debug logging
        System.out.println("Received userId: " + userId);
        System.out.println("Received password: " + password);
        
        User user = userService.findByUserId(userId);
        Map<String, Object> response = new HashMap<>();

        if (user != null && userService.verifyPassword(password, user.getUserPassword())) {
            response.put("token", "dummyToken"); // Replace with actual token generation logic
            response.put("userType", "user"); // Adjust user type as necessary
            response.put("userId", user.getUserId()); // Corrected to return actual userId
            response.put("username", user.getUserName());
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Invalid userId or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
//    @PostMapping("/login")
//    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
//        String userId = payload.get("userId");
//        String password = payload.get("password");
//
//        User user = userService.findByUserId(userId);
//        Map<String, Object> response = new HashMap<>();
//
//        if (user != null && userService.verifyPassword(password, user.getUserPassword())) {
//            // Generate JWT token
//            String token = tokenService.generateToken(userId);
//            response.put("token", token);
//            response.put("userType", "user"); // Adjust as per your logic
//            response.put("userId", user.getUserId());
//            return ResponseEntity.ok(response);
//        } else {
//            response.put("error", "Invalid userId or password");
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
    
}
