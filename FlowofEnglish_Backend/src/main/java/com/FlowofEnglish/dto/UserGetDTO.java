package com.FlowofEnglish.dto;

import java.util.List;

public class UserGetDTO {
    private String userId;
    private String userAddress;
    private String userEmail;
    private String userName;
    private String userPhoneNumber;
    private String userType;

    private OrganizationDTO organization;
    private List<CohortDTO> allCohorts;
    private List<ProgramDTO> allPrograms;

    private CohortDTO cohort; 
    private ProgramDTO program;

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

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public OrganizationDTO getOrganization() {
        return organization;
    }

    public void setOrganization(OrganizationDTO organization) {
        this.organization = organization;
    }

    public List<CohortDTO> getAllCohorts() {
        return allCohorts;
    }

    public void setAllCohorts(List<CohortDTO> allCohorts) {
        this.allCohorts = allCohorts;
    }

    public List<ProgramDTO> getAllPrograms() {
        return allPrograms;
    }

    public void setAllPrograms(List<ProgramDTO> allPrograms) {
        this.allPrograms = allPrograms;
    }

    public CohortDTO getCohort() {
        return cohort;
    }

    public void setCohort(CohortDTO cohort) {
        this.cohort = cohort;
    }

    public ProgramDTO getProgram() {
        return program;
    }

    public void setProgram(ProgramDTO program) {
        this.program = program;
    }
}
