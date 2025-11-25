package com.FlowofEnglish.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MentorCohortUsersResponseDTO {

    private OrganizationDTO organization;
    private CohortDetailsDTO cohort;
    private List<UserDTO> users;

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

    public List<UserDTO> getUsers() {
        return users;
    }

    public void setUsers(List<UserDTO> users) {
        this.users = users;
    }
}
