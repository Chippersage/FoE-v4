package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Program")
public class Program {

    @Id
    @Column(name = "program_id", length = 500)
    private String programId;

    @Column(name = "levels")
    private int levels;

    @Column(name = "unit_count")
    private int unitCount;

    @Column(name = "program_desc", length = 500)
    private String programDesc;

    @Column(name = "program_name", length = 255, nullable = false)
    private String programName;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

	public Program() {
		
	}

	public Program(String programId, int levels, int unitCount, String programDesc, String programName, String uuid) {
		super();
		this.programId = programId;
		this.levels = levels;
		this.unitCount = unitCount;
		this.programDesc = programDesc;
		this.programName = programName;
		this.uuid = uuid;
	}

	public String getProgramId() {
		return programId;
	}

	public void setProgramId(String programId) {
		this.programId = programId;
	}

	public int getLevels() {
		return levels;
	}

	public void setLevels(int levels) {
		this.levels = levels;
	}

	public int getUnitCount() {
		return unitCount;
	}

	public void setUnitCount(int unitCount) {
		this.unitCount = unitCount;
	}

	public String getProgramDesc() {
		return programDesc;
	}

	public void setProgramDesc(String programDesc) {
		this.programDesc = programDesc;
	}

	public String getProgramName() {
		return programName;
	}

	public void setProgramName(String programName) {
		this.programName = programName;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	@Override
	public String toString() {
		return "Program [programId=" + programId + ", levels=" + levels + ", unitCount=" + unitCount + ", programDesc="
				+ programDesc + ", programName=" + programName + ", uuid=" + uuid + "]";
	}

	// Method to ensure UUID and generate programId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
    
}
