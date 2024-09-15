package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "CohortProgram")
public class CohortProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cohort_program_id")
    private long cohortProgramId;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

	public CohortProgram() {
		
	}

	public CohortProgram(long cohortProgramId, String uuid, Cohort cohort, Unit unit, Program program) {
		super();
		this.cohortProgramId = cohortProgramId;
		this.uuid = uuid;
		this.cohort = cohort;
		this.unit = unit;
		this.program = program;
	}

	public long getCohortProgramId() {
		return cohortProgramId;
	}

	public void setCohortProgramId(long cohortProgramId) {
		this.cohortProgramId = cohortProgramId;
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

	@Override
	public String toString() {
		return "CohortProgram [cohortProgramId=" + cohortProgramId + ", uuid=" + uuid + ", cohort=" + cohort + ", unit="
				+ unit + ", program=" + program + "]";
	}

	// Method to ensure UUID and generate cohort_program_id before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
 
}
