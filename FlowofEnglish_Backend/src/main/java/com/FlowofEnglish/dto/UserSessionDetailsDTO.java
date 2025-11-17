package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSessionDetailsDTO {
	private String userId;
    private String userName;
    private String userType;
    private String userEmail;
    private String status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime deactivatedAt;
    private String deactivatedReason;
    private List<SessionTimestampDTO> recentSessions;
    
    // Getters and Setters
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
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
	public List<SessionTimestampDTO> getRecentSessions() {
		return recentSessions;
	}
	public void setRecentSessions(List<SessionTimestampDTO> recentSessions) {
		this.recentSessions = recentSessions;
	}	
    
}
