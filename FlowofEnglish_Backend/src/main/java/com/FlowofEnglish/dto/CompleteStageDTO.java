package com.FlowofEnglish.dto;

import java.util.*;

public class CompleteStageDTO {
    private String stageId;
    private String stageName;
    private String stageDesc;
    private String stageCompletionStatus;
    private boolean stageEnabled;
    private Integer daysUntilNextStageEnabled;
    private String stageAvailableDate;
    private List<CompleteUnitDTO> units;
    
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
    
    public String getStageCompletionStatus() {
        return stageCompletionStatus;
    }
    
    public void setStageCompletionStatus(String stageCompletionStatus) {
        this.stageCompletionStatus = stageCompletionStatus;
    }
    
    public boolean isStageEnabled() {
        return stageEnabled;
    }
    
    public void setStageEnabled(boolean stageEnabled) {
        this.stageEnabled = stageEnabled;
    }
    
    public Integer getDaysUntilNextStageEnabled() {
        return daysUntilNextStageEnabled;
    }
    
    public void setDaysUntilNextStageEnabled(Integer daysUntilNextStageEnabled) {
        this.daysUntilNextStageEnabled = daysUntilNextStageEnabled;
    }
    
    public String getStageAvailableDate() {
        return stageAvailableDate;
    }
    
    public void setStageAvailableDate(String stageAvailableDate) {
        this.stageAvailableDate = stageAvailableDate;
    }
    
    public List<CompleteUnitDTO> getUnits() {
        return units;
    }
    
    public void setUnits(List<CompleteUnitDTO> units) {
        this.units = units;
    }
}