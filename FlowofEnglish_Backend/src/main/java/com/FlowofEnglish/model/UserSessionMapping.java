package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "UserSessionMapping")
public class UserSessionMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private int sessionId;

    @Column(name = "session_end_timestamp")
    private LocalDateTime sessionEndTimestamp;

    @Column(name = "session_score")
    private int sessionScore;

    @Column(name = "session_start_timestamp")
    private LocalDateTime sessionStartTimestamp;

    @Column(name = "uuid", length = 16, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

 // Default constructor
	public UserSessionMapping() {
		
	}



	public UserSessionMapping(int sessionId, LocalDateTime sessionEndTimestamp, int sessionScore,
			LocalDateTime sessionStartTimestamp, String uuid, Cohort cohort, User user) {
		super();
		this.sessionId = sessionId;
		this.sessionEndTimestamp = sessionEndTimestamp;
		this.sessionScore = sessionScore;
		this.sessionStartTimestamp = sessionStartTimestamp;
		this.uuid = uuid;
		this.cohort = cohort;
		this.user = user;
	}


	// Getters and Setters
	public int getSessionId() {
		return sessionId;
	}



	public void setSessionId(int sessionId) {
		this.sessionId = sessionId;
	}



	public LocalDateTime getSessionEndTimestamp() {
		return sessionEndTimestamp;
	}



	public void setSessionEndTimestamp(LocalDateTime sessionEndTimestamp) {
		this.sessionEndTimestamp = sessionEndTimestamp;
	}



	public int getSessionScore() {
		return sessionScore;
	}



	public void setSessionScore(int sessionScore) {
		this.sessionScore = sessionScore;
	}



	public LocalDateTime getSessionStartTimestamp() {
		return sessionStartTimestamp;
	}



	public void setSessionStartTimestamp(LocalDateTime sessionStartTimestamp) {
		this.sessionStartTimestamp = sessionStartTimestamp;
	}



	public String getUuid() {
		return uuid;
	}



	public void setUuid(String uuid) {
		this.uuid = uuid;
	}



	public Cohort getCohort() {
		return cohort;
	}



	public void setCohort(Cohort cohort) {
		this.cohort = cohort;
	}



	public User getUser() {
		return user;
	}



	public void setUser(User user) {
		this.user = user;
	}



	
	@Override
	public String toString() {
		return "UserSessionMapping [sessionId=" + sessionId + ", sessionEndTimestamp=" + sessionEndTimestamp
				+ ", sessionScore=" + sessionScore + ", sessionStartTimestamp=" + sessionStartTimestamp + ", uuid="
				+ uuid + ", cohort=" + cohort + ", user=" + user + "]";
	}



	// Method to ensure UUID and generate sessionId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }

}
