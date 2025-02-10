package com.FlowofEnglish.dto;

import java.util.List;

public class UserDetailsWithCohortsAndProgramsDTO {
	private String userId;
    private String userName;
    private String userEmail;
    private String userPhoneNumber;
    private String userAddress;
    private String userType;
    private OrganizationDTO organization;
    private List<CohortProgramDTO> allCohortsWithPrograms;
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getUserEmail() {
		return userEmail;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}
	public String getUserPhoneNumber() {
		return userPhoneNumber;
	}
	public void setUserPhoneNumber(String userPhoneNumber) {
		this.userPhoneNumber = userPhoneNumber;
	}
	public String getUserAddress() {
		return userAddress;
	}
	public void setUserAddress(String userAddress) {
		this.userAddress = userAddress;
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
	public List<CohortProgramDTO> getAllCohortsWithPrograms() {
		return allCohortsWithPrograms;
	}
	public void setAllCohortsWithPrograms(List<CohortProgramDTO> allCohortsWithPrograms) {
		this.allCohortsWithPrograms = allCohortsWithPrograms;
	}

}
