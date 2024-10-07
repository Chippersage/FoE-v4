package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Program_Subconcepts")
public class ProgramConceptsMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programconcept_id", length = 500, nullable = false, unique = true)
    private Long programConceptId;
    

    @Column(name = "program_concept_desc", length = 500, nullable = false)
    private String programConceptDesc;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "subconcept_id", nullable = false)
    private Subconcept subconcept;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    public ProgramConceptsMapping() {
    }

    public ProgramConceptsMapping(Long programConceptId, String programConceptDesc, Unit unit, Stage stage,
                                  Program program, Subconcept subconcept, String uuid) {
        this.programConceptId = programConceptId;
        this.programConceptDesc = programConceptDesc;
        this.unit = unit;
        this.stage = stage;
        this.program = program;
        this.subconcept = subconcept;
        this.uuid = uuid;
    }

    // Getters & Setters
    public Long getProgramConceptId() {
        return programConceptId;
    }

    public void setProgramConceptId(Long programConceptId) {
        this.programConceptId = programConceptId;
    }

    public String getProgramConceptDesc() {
        return programConceptDesc;
    }

    public void setProgramConceptDesc(String programConceptDesc) {
        this.programConceptDesc = programConceptDesc;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public Stage getStage() {
        return stage;
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
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
        return "ProgramConceptsMapping [programConceptId=" + programConceptId + ", programConceptDesc="
                + programConceptDesc + ", unit=" + unit + ", stage=" + stage + ", program=" + program + ", subconcept="
                + subconcept + ", uuid=" + uuid + "]";
    }

    // Method to ensure UUID and generate programConceptId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
