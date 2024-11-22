package com.FlowofEnglish.dto;

import java.util.List;

public class CohortProgressDTO {
    private String programName;
    private String cohortName;
    private List<UserProgressDTO> users;
    
    // Getters and Setters
	public String getProgramName() {
		return programName;
	}
	public void setProgramName(String programName) {
		this.programName = programName;
	}
	public String getCohortName() {
		return cohortName;
	}
	public void setCohortName(String cohortName) {
		this.cohortName = cohortName;
	}
	public List<UserProgressDTO> getUsers() {
		return users;
	}
	public void setUsers(List<UserProgressDTO> users) {
		this.users = users;
	}
}