package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "LevelUnitMapping")
public class LevelUnitMapping {

    @Id
    @Column(name = "level_id", length = 500)
    private String levelId;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

	public LevelUnitMapping() {
		
	}

	public LevelUnitMapping(String levelId, String uuid, Unit unit, Program program) {
		super();
		this.levelId = levelId;
		this.uuid = uuid;
		this.unit = unit;
		this.program = program;
	}

	public String getLevelId() {
		return levelId;
	}

	public void setLevelId(String levelId) {
		this.levelId = levelId;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
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
		return "LevelUnitMapping [levelId=" + levelId + ", uuid=" + uuid + ", unit=" + unit + ", program=" + program
				+ "]";
	}

	// Method to ensure UUID and generate levelId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
    
}
