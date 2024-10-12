package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "UserSubConcept_completion",
      uniqueConstraints = @UniqueConstraint(columnNames = {"subconcept_id", "user_id"})) // Added unique constraint
public class UserSubConcept {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_subconcept_id", nullable = false, unique = true)
    private Long userSubconceptId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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
    
    
    // A transient field to represent completion status without persisting it
    @Transient
    private boolean completionStatus;
	

    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    // Default constructor
    public UserSubConcept() {
        // Auto-generate UUID
    }

    public UserSubConcept(User user, Program program, Stage stage, Unit unit, Subconcept subconcept) {
        this.user = user;
        this.program = program;
        this.stage = stage;
        this.unit = unit;
        this.subconcept = subconcept;
    }

    // Getters and Setters
    public Long getUserSubconceptId() {
        return userSubconceptId;
    }

    public void setUserSubconceptId(Long userSubconceptId) {
        this.userSubconceptId = userSubconceptId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }

 // Setters and Getters for completionStatus (non-persistent)
    public boolean getCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(boolean completionStatus) {
        this.completionStatus = completionStatus;
    }
}
