package com.FlowofEnglish.dto;

import java.util.Map;

public class StageDTO {
    private String stageId;
    private String stageName;
    private String stageDesc;
    private String stageCompletionStatus;
    private Map<String, UnitResponseDTO> units; // Use a Map for dynamic keys
    
    // Getters and Setters  
    public Map<String, UnitResponseDTO> getUnits() {
		return units;
	}
	public void setUnits(Map<String, UnitResponseDTO> units) {
		this.units = units;
	}
	public String getStageCompletionStatus() {
		return stageCompletionStatus;
	}
	public void setStageCompletionStatus(String stageCompletionStatus) {
		this.stageCompletionStatus = stageCompletionStatus;
	}
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
    
    
   
}
