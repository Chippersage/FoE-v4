package com.FlowofEnglish.model;


import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Stage")
public class Stage {

    @Id
    @Column(name = "stage_id", nullable = false, unique = true)
    private String stageId;

    @Column(name = "stage_name", nullable = false)
    private String stageName;

    @Column(name = "stage_desc")
    private String stageDesc;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;
    
    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    // Default constructor
    public Stage() {
        //this.stageId = UUID.randomUUID().toString(); // Auto-generate unique stageId
    }

    public Stage(String stageId, String stageName, String stageDesc, Program program, String uuid) {
        this.stageId = stageId;
        		//UUID.randomUUID().toString();
        this.stageName = stageName;
        this.stageDesc = stageDesc;
        this.program = program;
        this.uuid = uuid;
    }

    // Getters and Setters
    public String getStageId() {
        return stageId;
    }

    public void setStageId(String stageId) {
        this.stageId = stageId;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
    }

    public String getStageDesc() {
        return stageDesc;
    }

    public void setStageDesc(String stageDesc) {
        this.stageDesc = stageDesc;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	@Override
	public String toString() {
		return "Stage [stageId=" + stageId + ", stageName=" + stageName + ", stageDesc=" + stageDesc + ", program="
				+ program + ", uuid=" + uuid + "]";
	}
	// Method to ensure UUID and generate stageId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
	
}
