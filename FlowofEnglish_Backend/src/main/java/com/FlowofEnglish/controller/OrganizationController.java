package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.Organization;
import com.FlowofEnglish.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    // Get all organizations
    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        List<Organization> organizations = organizationService.getAllOrganizations();
        return ResponseEntity.ok(organizations);
    }

    // Create a new organization
    @PostMapping("/create")
//    @PreAuthorize("hasRole('SuperADMIN')
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization organization) {
        Organization createdOrganization = organizationService.createOrganization(organization);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrganization);
    }

    // Update an existing organization
    @PutMapping("/{organizationId}")
    public ResponseEntity<Organization> updateOrganization(
            @PathVariable String organizationId,
            @RequestBody Organization organization) {
        Organization updatedOrganization = organizationService.getOrganizationById(organizationId);

        if (updatedOrganization == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Update organization details and save
        updatedOrganization.setOrganizationName(organization.getOrganizationName());
        updatedOrganization.setOrganizationAdminEmail(organization.getOrganizationAdminEmail());
        // Add any other fields you want to update
        Organization savedOrganization = organizationService.saveOrganization(updatedOrganization);

        return ResponseEntity.ok(savedOrganization);
    }

    // Delete an organization by ID
    @DeleteMapping("/{organizationId}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String organizationId) {
        organizationService.deleteOrganizationById(organizationId);
        return ResponseEntity.noContent().build();
    }

    // Delete multiple organizations
    @DeleteMapping
    public ResponseEntity<Void> deleteOrganizations(@RequestBody List<String> organizationIds) {
        for (String id : organizationIds) {
            organizationService.deleteOrganizationById(id);
        }
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String adminEmail = loginData.get("organizationAdminEmail");
        String password = loginData.get("orgPassword");

        Organization organization;
        try {
            organization = organizationService.getOrganizationByEmail(adminEmail);
        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Server error: multiple organizations found with the same email");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        if (organization != null && organization.getOrgpassword().equals(password)) {
            // Login successful
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("organizationId", organization.getOrganizationId());
            response.put("organizationName", organization.getOrganizationName());
            return ResponseEntity.ok(response);
        } else {
            // Invalid credentials
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
 // Method to handle forgotten password
    @PostMapping("/forgotorgpassword")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        try {
            organizationService.sendForgotPasswordOTP(email);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to email.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Method to reset organization password using OTP
    @PostMapping("/resetorgpassword")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String organisationName = request.get("organisationName");
        String email = request.get("email");
        String otp = request.get("otp");

        try {
            organizationService.resetPassword(organisationName, email, otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "New password sent to email.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

}
