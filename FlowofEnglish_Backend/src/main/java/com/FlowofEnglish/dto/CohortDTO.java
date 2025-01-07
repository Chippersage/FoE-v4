package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;

public class CohortDTO {

    private String cohortId;
    private String cohortName;
    private OffsetDateTime cohortStartDate;
    private OffsetDateTime cohortEndDate;
    
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
}
