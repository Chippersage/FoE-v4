package com.FlowofEnglish.dto;


import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CohortSessionsResponseDTO {
    private OrganizationDTO organization;
    private CohortDetailsDTO cohort;
    private List<UserSessionDetailsDTO> users;
    
   // Getters and setters
	public OrganizationDTO getOrganization() {
		return organization;
	}
	public void setOrganization(OrganizationDTO organization) {
		this.organization = organization;
	}
	public CohortDetailsDTO getCohort() {
		return cohort;
	}
	public void setCohort(CohortDetailsDTO cohort) {
		this.cohort = cohort;
	}
	public List<UserSessionDetailsDTO> getUsers() {
		return users;
	}
	public void setUsers(List<UserSessionDetailsDTO> users) {
		this.users = users;
	}
   
}