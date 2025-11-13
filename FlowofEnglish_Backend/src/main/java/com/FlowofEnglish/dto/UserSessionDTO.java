package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSessionDTO {
	private String userId;
    private String userName;
    private String userType;
    private String userEmail;
    private OffsetDateTime createdAt;
    private OffsetDateTime deactivatedAt;
    private String deactivatedReason;
    private String status;
    private String cohortId;
    private String cohortName;
    private OffsetDateTime sessionStartTimestamp;
    private OffsetDateTime sessionEndTimestamp;
    private String sessionId;
    private OrganizationDTO organization;
    private ProgramCountDTO program;
    private int totalUsers;
    private int activeUsers; 
    private int deactivatedUsers;


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
	public String getUserType() {
		return userType;
	}
	public void setUserType(String userType) {
		this.userType = userType;
	}
	public String getUserEmail() {
		return userEmail;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}
	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public OffsetDateTime getDeactivatedAt() {
		return deactivatedAt;
	}
	public void setDeactivatedAt(OffsetDateTime deactivatedAt) {
		this.deactivatedAt = deactivatedAt;
	}
	public String getDeactivatedReason() {
		return deactivatedReason;
	}
	public void setDeactivatedReason(String deactivatedReason) {
		this.deactivatedReason = deactivatedReason;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getCohortId() {
		return cohortId;
	}
	public void setCohortId(String cohortId) {
		this.cohortId = cohortId;
	}
	public String getCohortName() {
		return cohortName;
	}
	public void setCohortName(String cohortName) {
		this.cohortName = cohortName;
	}
	public OffsetDateTime getSessionStartTimestamp() {
		return sessionStartTimestamp;
	}
	public void setSessionStartTimestamp(OffsetDateTime sessionStartTimestamp) {
		this.sessionStartTimestamp = sessionStartTimestamp;
	}
	public OffsetDateTime getSessionEndTimestamp() {
		return sessionEndTimestamp;
	}
	public void setSessionEndTimestamp(OffsetDateTime sessionEndTimestamp) {
		this.sessionEndTimestamp = sessionEndTimestamp;
	}
	public String getSessionId() {
		return sessionId;
	}
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	public OrganizationDTO getOrganization() {
		return organization;
	}
	public void setOrganization(OrganizationDTO organization) {
		this.organization = organization;
	}
	public ProgramCountDTO getProgram() {
		return program;
	}
	public void setProgram(ProgramCountDTO program) {
		this.program = program;
	}
	public int getTotalUsers() {
		return totalUsers;
	}
	public void setTotalUsers(int totalUsers) {
		this.totalUsers = totalUsers;
	}
	public int getActiveUsers() {
		return activeUsers;
	}
	public void setActiveUsers(int activeUsers) {
		this.activeUsers = activeUsers;
	}
	public int getDeactivatedUsers() {
		return deactivatedUsers;
	}
	public void setDeactivatedUsers(int deactivatedUsers) {
		this.deactivatedUsers = deactivatedUsers;
	}

    
}
