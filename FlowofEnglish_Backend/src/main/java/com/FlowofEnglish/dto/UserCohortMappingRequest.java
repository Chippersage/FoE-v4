package com.FlowofEnglish.dto;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserCohortMappingRequest {
	private String cohortId;
    private String userId;
    // Getters and setters
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
    
}


