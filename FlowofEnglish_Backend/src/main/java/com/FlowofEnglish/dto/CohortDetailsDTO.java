package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CohortDetailsDTO {
    private String cohortId;
    private String cohortName;
    private OffsetDateTime cohortStartDate;
    private OffsetDateTime cohortEndDate;
    private ProgramCountDTO program;
    private int totalUsers;
	private int activeUsers;
    private int deactivatedUsers;
    
    // Getters and Setters
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
	public OffsetDateTime getCohortStartDate() {
		return cohortStartDate;
	}
	public void setCohortStartDate(OffsetDateTime cohortStartDate) {
		this.cohortStartDate = cohortStartDate;
	}
	public OffsetDateTime getCohortEndDate() {
		return cohortEndDate;
	}
	public void setCohortEndDate(OffsetDateTime cohortEndDate) {
		this.cohortEndDate = cohortEndDate;
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
