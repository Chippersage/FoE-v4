package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonFormat;
@Entity
@Table(name = "UserSessionMapping")
public class UserSessionMapping {

    @Id
    @Column(name = "session_id", length = 128)
    private String sessionId;  

    @Column(name = "session_end_timestamp", nullable = true)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime sessionEndTimestamp;

    @Column(name = "session_start_timestamp", nullable = false, updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @CreationTimestamp
    private OffsetDateTime sessionStartTimestamp;
    
    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor
    public UserSessionMapping() {}

    // Paralized constructor
    public UserSessionMapping(String sessionId, OffsetDateTime sessionEndTimestamp,
			OffsetDateTime sessionStartTimestamp, String uuid, Cohort cohort, User user) {
		super();
		this.sessionId = sessionId;
		this.sessionEndTimestamp = sessionEndTimestamp;
		this.sessionStartTimestamp = sessionStartTimestamp;
		this.uuid = uuid;
		this.cohort = cohort;
		this.user = user;
	}


	// Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public OffsetDateTime getSessionEndTimestamp() {
		return sessionEndTimestamp;
	}

	public void setSessionEndTimestamp(OffsetDateTime sessionEndTimestamp) {
		this.sessionEndTimestamp = sessionEndTimestamp;
	}

	public OffsetDateTime getSessionStartTimestamp() {
		return sessionStartTimestamp;
	}

	public void setSessionStartTimestamp(OffsetDateTime sessionStartTimestamp) {
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
    // Automatically generate UUID and session ID before persisting
    @PrePersist
    private void ensureSessionId() {
    	System.out.println("PrePersist triggered for UserSessionMapping");
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
            System.out.println("UUID generated: " + this.uuid);
        }
        if (this.sessionId == null) {
            this.sessionId = UUID.randomUUID().toString().replace("-", "") + System.nanoTime();
            System.out.println("Session ID generated: " + this.sessionId);
        }
    }
    
 
}
