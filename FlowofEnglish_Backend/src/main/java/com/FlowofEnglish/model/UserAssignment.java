package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "UserAssignments")
public class UserAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;
    
    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "subconcept_id", nullable = false)
    private Subconcept subconcept;

    @ManyToOne
    @JoinColumn(name = "submitted_file_id")
    private MediaFile submittedFile;

    @ManyToOne
    @JoinColumn(name = "corrected_file_id")
    private MediaFile correctedFile;

    @Column(name = "submitted_date", nullable = false)
    @CreationTimestamp
    private OffsetDateTime submittedDate;

    @Column(name = "corrected_date", nullable = true)
    @UpdateTimestamp
    private OffsetDateTime correctedDate;

    @Column(name = "score", nullable = true)
    private Integer score;
    
    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;


    public UserAssignment() {
		}

	public UserAssignment(Long assignmentId, User user, Cohort cohort, Program program, Stage stage, Unit unit,
			Subconcept subconcept, MediaFile submittedFile, MediaFile correctedFile, OffsetDateTime submittedDate,
			OffsetDateTime correctedDate, Integer score, String uuid) {
		super();
		this.assignmentId = assignmentId;
		this.user = user;
		this.cohort = cohort;
		this.program = program;
		this.stage = stage;
		this.unit = unit;
		this.subconcept = subconcept;
		this.submittedFile = submittedFile;
		this.correctedFile = correctedFile;
		this.submittedDate = submittedDate;
		this.correctedDate = correctedDate;
		this.score = score;
		this.uuid = uuid;
	}

	// Getters and Setters

	public Long getAssignmentId() {
		return assignmentId;
	}

	public void setAssignmentId(Long assignmentId) {
		this.assignmentId = assignmentId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Cohort getCohort() {
		return cohort;
	}

	public void setCohort(Cohort cohort) {
		this.cohort = cohort;
	}

	public Program getProgram() {
		return program;
	}

	public void setProgram(Program program) {
		this.program = program;
	}

	public Stage getStage() {
		return stage;
	}

	public void setStage(Stage stage) {
		this.stage = stage;
	}

	public Unit getUnit() {
		return unit;
	}

	public void setUnit(Unit unit) {
		this.unit = unit;
	}

	public Subconcept getSubconcept() {
		return subconcept;
	}

	public void setSubconcept(Subconcept subconcept) {
		this.subconcept = subconcept;
	}

	public MediaFile getSubmittedFile() {
		return submittedFile;
	}

	public void setSubmittedFile(MediaFile submittedFile) {
		this.submittedFile = submittedFile;
	}

	public MediaFile getCorrectedFile() {
		return correctedFile;
	}

	public void setCorrectedFile(MediaFile correctedFile) {
		this.correctedFile = correctedFile;
	}

	public OffsetDateTime getSubmittedDate() {
		return submittedDate;
	}

	public void setSubmittedDate(OffsetDateTime submittedDate) {
		this.submittedDate = submittedDate;
	}

	public OffsetDateTime getCorrectedDate() {
		return correctedDate;
	}

	public void setCorrectedDate(OffsetDateTime correctedDate) {
		this.correctedDate = correctedDate;
	}

	public Integer getScore() {
		return score;
	}

	public void setScore(Integer score) {
		this.score = score;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	@Override
	public String toString() {
		return "UserAssignment [assignmentId=" + assignmentId + ", user=" + user + ", cohort=" + cohort + ", program="
				+ program + ", stage=" + stage + ", unit=" + unit + ", subconcept=" + subconcept + ", submittedFile="
				+ submittedFile + ", correctedFile=" + correctedFile + ", submittedDate=" + submittedDate
				+ ", correctedDate=" + correctedDate + ", score=" + score + ", uuid=" + uuid + "]";
	}
	
// Ensure UUID and default timestamps to UTC
    @PrePersist
    @PreUpdate
    private void initializeOrAdjustTimestamps() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }

        ZoneOffset utcZoneOffset = ZoneOffset.UTC;

        if (this.submittedDate == null) {
            this.submittedDate = OffsetDateTime.now(utcZoneOffset);
        }

        if (this.correctedDate == null) {
            this.correctedDate = OffsetDateTime.now(utcZoneOffset);
        }
    }

	

}
