package com.FlowofEnglish.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "User")
public class User {

    @Id
    @Column(name = "user_id", length = 255)
    private String userId;

    @Column(name = "user_address", length = 1000, nullable = true)
    private String userAddress;

    @Column(name = "user_email", length = 50, nullable = true)
    private String userEmail;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_phone_number", length = 15, nullable = true)
    private String userPhoneNumber;

    @Column(name = "user_password", length = 255, nullable = false)
    private String userPassword;

    @Column(name = "user_type", length = 100, nullable = false)
    private String userType;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAttempts> userAttempts = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserCohortMapping> userCohortMappings = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSessionMapping> userSessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSubConcept> userSubConcept = new ArrayList<>();

    
    public User() { }
    

    public User(String userId, String userAddress, String userEmail, String userName, String userPhoneNumber,
                String userPassword, String userType, String uuid, Organization organization) {
        this.userId = userId;
        this.userAddress = userAddress;
        this.userEmail = userEmail;
        this.userName = userName;
        this.userPhoneNumber = userPhoneNumber;
        this.userPassword = userPassword;
        this.userType = userType;
        this.uuid = uuid;
        this.organization = organization;
    }

    

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserAddress() {
        return userAddress;
    }

    public void setUserAddress(String userAddress) {
        this.userAddress = userAddress;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhoneNumber() {
        return userPhoneNumber;
    }

    public void setUserPhoneNumber(String userPhoneNumber) {
        this.userPhoneNumber = userPhoneNumber;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;  
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public List<UserCohortMapping> getUserCohortMappings() {
		return userCohortMappings;
	}


	public void setUserCohortMappings(List<UserCohortMapping> userCohortMappings) {
		this.userCohortMappings = userCohortMappings;
	}


	@Override
    public String toString() {
        return "User [userId=" + userId + ", userAddress=" + userAddress + ", userEmail=" + userEmail + ", userName="
                + userName + ", userPhoneNumber=" + userPhoneNumber + ", userPassword=" + userPassword + ", userType="
                + userType + ", uuid=" + uuid + ", organization=" + organization + "]";
    }

    // Method to ensure UUID and generate userId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
