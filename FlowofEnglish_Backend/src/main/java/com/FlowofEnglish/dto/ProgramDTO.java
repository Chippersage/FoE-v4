package com.FlowofEnglish.dto;

public class ProgramDTO {

    private String programId;
    private String programName;
    private String programDesc;
    private int Stages;
    private int unitCount;

    // Getters and Setters

    public String getProgramId() {
        return programId;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getProgramDesc() {
        return programDesc;
    }

    public void setProgramDesc(String programDesc) {
        this.programDesc = programDesc;
    }

	public int getStages() {
		return Stages;
	}

	public void setStages(int stages) {
		Stages = stages;
	}

	public int getUnitCount() {
		return unitCount;
	}

	public void setUnitCount(int unitCount) {
		this.unitCount = unitCount;
	}

	
}

