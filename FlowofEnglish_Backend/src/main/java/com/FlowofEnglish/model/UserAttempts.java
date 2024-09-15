package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "UserAttempts")
public class UserAttempts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_attempt_id")
    private int userAttemptId;

    @Column(name = "user_attempt_end_timestamp")
    private LocalDateTime userAttemptEndTimestamp;

    @Column(name = "user_attempt_flag", columnDefinition = "BIT", nullable = false)
    private boolean userAttemptFlag;

    @Column(name = "user_attempt_score", nullable = false)
    private int userAttemptScore;

    @Column(name = "user_attempt_start_timestamp", nullable = false)
    private LocalDateTime userAttemptStartTimestamp;

    @ManyToOne
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private UserSessionMapping session;

    @ManyToOne
    @JoinColumn(name = "subconcept_id", nullable = false)
    private Subconcept subconcept;

    @Column(name = "uuid",  nullable = false, unique = true)
    private String uuid;
    
 // Default constructor
	public UserAttempts() {}

	

    public UserAttempts(int userAttemptId, LocalDateTime userAttemptEndTimestamp, boolean userAttemptFlag,
			int userAttemptScore, LocalDateTime userAttemptStartTimestamp, Concept concept, Unit unit, Program program,
			UserSessionMapping session, Subconcept subconcept, String uuid) {
		super();
		this.userAttemptId = userAttemptId;
		this.userAttemptEndTimestamp = userAttemptEndTimestamp;
		this.userAttemptFlag = userAttemptFlag;
		this.userAttemptScore = userAttemptScore;
		this.userAttemptStartTimestamp = userAttemptStartTimestamp;
		this.concept = concept;
		this.unit = unit;
		this.program = program;
		this.session = session;
		this.subconcept = subconcept;
		this.uuid = uuid;
	}


 // Getters and Setters

	public int getUserAttemptId() {
		return userAttemptId;
	}



	public void setUserAttemptId(int userAttemptId) {
		this.userAttemptId = userAttemptId;
	}



	public LocalDateTime getUserAttemptEndTimestamp() {
		return userAttemptEndTimestamp;
	}



	public void setUserAttemptEndTimestamp(LocalDateTime userAttemptEndTimestamp) {
		this.userAttemptEndTimestamp = userAttemptEndTimestamp;
	}



	public boolean isUserAttemptFlag() {
		return userAttemptFlag;
	}



	public void setUserAttemptFlag(boolean userAttemptFlag) {
		this.userAttemptFlag = userAttemptFlag;
	}



	public int getUserAttemptScore() {
		return userAttemptScore;
	}



	public void setUserAttemptScore(int userAttemptScore) {
		this.userAttemptScore = userAttemptScore;
	}



	public LocalDateTime getUserAttemptStartTimestamp() {
		return userAttemptStartTimestamp;
	}



	public void setUserAttemptStartTimestamp(LocalDateTime userAttemptStartTimestamp) {
		this.userAttemptStartTimestamp = userAttemptStartTimestamp;
	}



	public Concept getConcept() {
		return concept;
	}



	public void setConcept(Concept concept) {
		this.concept = concept;
	}



	public Unit getUnit() {
		return unit;
	}



	public void setUnit(Unit unit) {
		this.unit = unit;
	}



	public Program getProgram() {
		return program;
	}



	public void setProgram(Program program) {
		this.program = program;
	}



	public UserSessionMapping getSession() {
		return session;
	}



	public void setSession(UserSessionMapping session) {
		this.session = session;
	}



	public Subconcept getSubconcept() {
		return subconcept;
	}



	public void setSubconcept(Subconcept subconcept) {
		this.subconcept = subconcept;
	}



	public String getUuid() {
		return uuid;
	}



	public void setUuid(String uuid) {
		this.uuid = uuid;
	}



	@Override
	public String toString() {
		return "UserAttempts [userAttemptId=" + userAttemptId + ", userAttemptEndTimestamp=" + userAttemptEndTimestamp
				+ ", userAttemptFlag=" + userAttemptFlag + ", userAttemptScore=" + userAttemptScore
				+ ", userAttemptStartTimestamp=" + userAttemptStartTimestamp + ", concept=" + concept + ", unit=" + unit
				+ ", program=" + program + ", session=" + session + ", subconcept=" + subconcept + ", uuid=" + uuid
				+ "]";
	}



	
	// Method to ensure UUID and generate userAttemptId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
