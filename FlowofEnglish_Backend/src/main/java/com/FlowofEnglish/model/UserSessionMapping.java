package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
@Entity
@Table(name = "UserSessionMapping")
public class UserSessionMapping {

    @Id
    @Column(name = "session_id", length = 128)
    private String sessionId;  

    @Column(name = "session_end_timestamp", nullable = true)
    private LocalDateTime sessionEndTimestamp;

    @Column(name = "session_start_timestamp", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime sessionStartTimestamp;
    
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

    public UserSessionMapping(String sessionId, LocalDateTime sessionEndTimestamp, 
            LocalDateTime sessionStartTimestamp, String uuid, Cohort cohort, User user) {
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

    public LocalDateTime getSessionEndTimestamp() {
        return sessionEndTimestamp;
    }

    public void setSessionEndTimestamp(LocalDateTime sessionEndTimestamp) {
        this.sessionEndTimestamp = sessionEndTimestamp;
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

 // Utility method to get IST timestamps
    public ZonedDateTime getSessionStartTimestampInIST() {
        return sessionStartTimestamp != null ? sessionStartTimestamp.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneId.of("Asia/Kolkata")) : null;
    }

    public ZonedDateTime getSessionEndTimestampInIST() {
        return sessionEndTimestamp != null ? sessionEndTimestamp.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneId.of("Asia/Kolkata")) : null;
    }
    
    
}
