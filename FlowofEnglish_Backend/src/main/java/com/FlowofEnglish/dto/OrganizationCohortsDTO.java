package com.FlowofEnglish.dto;

import java.util.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationCohortsDTO {
    private OrganizationDTO organization;
    private List<CohortDTO> cohorts;

    public OrganizationDTO getOrganization() { return organization; }
    public void setOrganization(OrganizationDTO organization) { this.organization = organization; }

    public List<CohortDTO> getCohorts() { return cohorts; }
    public void setCohorts(List<CohortDTO> cohorts) { this.cohorts = cohorts; }
}

