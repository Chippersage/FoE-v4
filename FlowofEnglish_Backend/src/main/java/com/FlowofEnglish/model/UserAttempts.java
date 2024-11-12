package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "UserAttempts")
public class UserAttempts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_attempt_id")
    private Long userAttemptId;

    @Column(name = "user_attempt_end_timestamp")
    private LocalDateTime userAttemptEndTimestamp;

    @Column(name = "user_attempt_flag", columnDefinition = "BIT", nullable = false)
    private boolean userAttemptFlag;

    @Column(name = "user_attempt_score", nullable = false)
    private int userAttemptScore;

    @Column(name = "user_attempt_start_timestamp", nullable = false)
    private LocalDateTime userAttemptStartTimestamp;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private UserSessionMapping session;

    @ManyToOne
    @JoinColumn(name = "subconcept_id", nullable = false)
    private Subconcept subconcept;

    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    // Default constructor
    public UserAttempts() {}

    public UserAttempts(Long userAttemptId, LocalDateTime userAttemptEndTimestamp, boolean userAttemptFlag,
                        int userAttemptScore, LocalDateTime userAttemptStartTimestamp, User user,
                        Unit unit, Program program, Stage stage, UserSessionMapping session,
                        Subconcept subconcept, String uuid) {
        this.userAttemptId = userAttemptId;
        this.userAttemptEndTimestamp = userAttemptEndTimestamp;
        this.userAttemptFlag = userAttemptFlag;
        this.userAttemptScore = userAttemptScore;
        this.userAttemptStartTimestamp = userAttemptStartTimestamp;
        this.user = user;
        this.unit = unit;
        this.program = program;
        this.session = session;
        this.subconcept = subconcept;
        this.stage = stage;
        this.uuid = uuid;
    }

    // Getters and Setters

    public Long getUserAttemptId() {
        return userAttemptId;
    }

    public void setUserAttemptId(Long userAttemptId) {
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public Stage getStage() {
        return stage;
    }

    public void setStage(Stage stage) {
        this.stage = stage;
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
        return "UserAttempts{" +
                "userAttemptId=" + userAttemptId +
                ", userAttemptEndTimestamp=" + userAttemptEndTimestamp +
                ", userAttemptFlag=" + userAttemptFlag +
                ", userAttemptScore=" + userAttemptScore +
                ", userAttemptStartTimestamp=" + userAttemptStartTimestamp +
                ", unit=" + unit +
                ", program=" + program +
                ", stage=" + stage +
                ", user=" + user +
                ", session=" + session +
                ", subconcept=" + subconcept +
                ", uuid='" + uuid + '\'' +
                '}';
    }

    // Ensure UUID and convert timestamps to IST
    @PrePersist
    @PreUpdate
    private void initializeOrAdjustTimestamps() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
        
        ZoneId istZoneId = ZoneId.of("Asia/Kolkata");
        
        if (this.userAttemptStartTimestamp != null) {
            this.userAttemptStartTimestamp = 
                ZonedDateTime.of(this.userAttemptStartTimestamp, istZoneId).toLocalDateTime();
        }
        
        if (this.userAttemptEndTimestamp != null) {
            this.userAttemptEndTimestamp = 
                ZonedDateTime.of(this.userAttemptEndTimestamp, istZoneId).toLocalDateTime();
        }
    }
}
