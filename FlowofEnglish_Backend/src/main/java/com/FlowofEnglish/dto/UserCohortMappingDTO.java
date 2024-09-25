package com.FlowofEnglish.dto;

public class UserCohortMappingDTO {
    //private String organizationName;
    private String cohortId;
    private String userId;
    private String userName;
    private String cohortName;
    private int leaderboardScore; 
    
 // Getters and Setters
    
	public int getLeaderboardScore() {
		return leaderboardScore;
	}

	public void setLeaderboardScore(int leaderboardScore) {
		this.leaderboardScore = leaderboardScore;
	}

//	public String getOrganizationName() {
//		return organizationName;
//	}
//	
//	
//	public void setOrganizationName(String organizationName) {
//		this.organizationName = organizationName;
//	}
	public String getCohortId() {
		return cohortId;
	}
	public void setCohortId(String cohortId) {
		this.cohortId = cohortId;
	}
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
	public String getCohortName() {
		return cohortName;
	}
	public void setCohortName(String cohortName) {
		this.cohortName = cohortName;
	}

    
    
    
}

