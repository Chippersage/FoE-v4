package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Cohorts")
public class Cohort {

    @Id
    @Column(name = "cohort_id", length = 255)
    private String cohortId;

    @Column(name = "cohort_creation", nullable = false)
    private LocalDateTime cohortCreation;

    @Column(name = "cohort_name", length = 100, nullable = false)
    private String cohortName;

    @Column(name = "cohort_end_date", nullable = false)
    private LocalDate cohortEndDate;

    @Column(name = "cohort_start_date", nullable = false)
    private LocalDate cohortStartDate;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Default constructor
    public Cohort() {
        
    }

    // Parameterized constructor
    public Cohort(String cohortId, LocalDateTime cohortCreation, String cohortName, LocalDate cohortEndDate,
            LocalDate cohortStartDate, String uuid, Organization organization) {
  this.cohortId = cohortId;
  this.cohortCreation = cohortCreation;
  this.cohortName = cohortName;
  this.cohortEndDate = cohortEndDate;
  this.cohortStartDate = cohortStartDate;
  this.uuid = uuid; // This should be either provided or handled by @PrePersist
  this.organization = organization;
}


	public String getCohortId() {
		return cohortId;
	}

	public void setCohortId(String cohortId) {
		this.cohortId = cohortId;
	}

	public LocalDateTime getCohortCreation() {
		return cohortCreation;
	}

	public void setCohortCreation(LocalDateTime cohortCreation) {
		this.cohortCreation = cohortCreation;
	}

	public String getCohortName() {
		return cohortName;
	}

	public void setCohortName(String cohortName) {
		this.cohortName = cohortName;
	}

	public LocalDate getCohortEndDate() {
		return cohortEndDate;
	}

	public void setCohortEndDate(LocalDate cohortEndDate) {
		this.cohortEndDate = cohortEndDate;
	}

	public LocalDate getCohortStartDate() {
		return cohortStartDate;
	}

	public void setCohortStartDate(LocalDate cohortStartDate) {
		this.cohortStartDate = cohortStartDate;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public Organization getOrganization() {
		return organization;
	}

	public void setOrganization(Organization organization) {
		this.organization = organization;
	}

	@Override
	public String toString() {
		return "Cohort [cohortId=" + cohortId + ", cohortCreation=" + cohortCreation + ", cohortName=" + cohortName
				+ ", cohortEndDate=" + cohortEndDate + ", cohortStartDate=" + cohortStartDate + ", uuid=" + uuid
				+ ", organization=" + organization + "]";
	}

	// Method to ensure UUID and generate cohortId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
       }
    }
