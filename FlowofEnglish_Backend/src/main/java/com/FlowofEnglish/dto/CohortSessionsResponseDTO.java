package com.FlowofEnglish.dto;

import java.util.List;

public class CohortSessionsResponseDTO {
	private OrganizationDTO organization;
    private ProgramCountDTO program;
    private List<UserSessionDTO> userSessions;
    
   // Getters and setters
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
	public List<UserSessionDTO> getUserSessions() {
		return userSessions;
	}
	public void setUserSessions(List<UserSessionDTO> userSessions) {
		this.userSessions = userSessions;
	}
	
   
}