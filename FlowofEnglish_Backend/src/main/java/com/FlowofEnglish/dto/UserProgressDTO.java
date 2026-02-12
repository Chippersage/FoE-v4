package com.FlowofEnglish.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProgressDTO {
    private String userId;
    private String userName;
    private String userType;
    private String userEmail;
    private String userAddress;
    private String userPhoneNumber;
    private int totalStages;
    private int completedStages;
    private int totalUnits;
    private int completedUnits;
    private int totalSubconcepts;
    private int completedSubconcepts;
    private int totalAssignments;
    private int completedAssignments;
    private int leaderboardScore;
    private OffsetDateTime recentAttemptDate;
    private OffsetDateTime createdAt;
    private String status;
    
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
	public String getUserAddress() {
		return userAddress;
	}
	public void setUserAddress(String userAddress) {
		this.userAddress = userAddress;
	}
	public String getUserPhoneNumber() {
		return userPhoneNumber;
	}
	public void setUserPhoneNumber(String userPhoneNumber) {
		this.userPhoneNumber = userPhoneNumber;
	}
	public int getTotalStages() {
		return totalStages;
	}
	public void setTotalStages(int totalStages) {
		this.totalStages = totalStages;
	}
	public int getCompletedStages() {
		return completedStages;
	}
	public void setCompletedStages(int completedStages) {
		this.completedStages = completedStages;
	}
	public int getTotalUnits() {
		return totalUnits;
	}
	public void setTotalUnits(int totalUnits) {
		this.totalUnits = totalUnits;
	}
	public int getCompletedUnits() {
		return completedUnits;
	}
	public void setCompletedUnits(int completedUnits) {
		this.completedUnits = completedUnits;
	}
	public int getTotalSubconcepts() {
		return totalSubconcepts;
	}
	public void setTotalSubconcepts(int totalSubconcepts) {
		this.totalSubconcepts = totalSubconcepts;
	}
	public int getCompletedSubconcepts() {
		return completedSubconcepts;
	}
	public void setCompletedSubconcepts(int completedSubconcepts) {
		this.completedSubconcepts = completedSubconcepts;
	}
	public int getTotalAssignments() {
		return totalAssignments;
	}
	public void setTotalAssignments(int totalAssignments) {
		this.totalAssignments = totalAssignments;
	}
	public int getCompletedAssignments() {
		return completedAssignments;
	}
	public void setCompletedAssignments(int completedAssignments) {
		this.completedAssignments = completedAssignments;
	}
	public int getLeaderboardScore() {
		return leaderboardScore;
	}
	public void setLeaderboardScore(int leaderboardScore) {
		this.leaderboardScore = leaderboardScore;
	}
	public OffsetDateTime getRecentAttemptDate() {
		return recentAttemptDate;
	}
	public void setRecentAttemptDate(OffsetDateTime recentAttemptDate) {
		this.recentAttemptDate = recentAttemptDate;
	}
	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
}
