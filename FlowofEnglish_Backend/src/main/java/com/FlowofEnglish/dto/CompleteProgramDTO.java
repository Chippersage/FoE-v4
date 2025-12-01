package com.FlowofEnglish.dto;

import java.util.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompleteProgramDTO {
    private String programId;
    private String programName;
    private String programDesc;
    private int stagesCount;
    private int unitCount;
    private String programCompletionStatus;
    private List<CompleteStageDTO> stages;
    
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
    
    public int getStagesCount() {
        return stagesCount;
    }
    
    public void setStagesCount(int stagesCount) {
        this.stagesCount = stagesCount;
    }
    
    public int getUnitCount() {
        return unitCount;
    }
    
    public void setUnitCount(int unitCount) {
        this.unitCount = unitCount;
    }
    
    public String getProgramCompletionStatus() {
        return programCompletionStatus;
    }
    
    public void setProgramCompletionStatus(String programCompletionStatus) {
        this.programCompletionStatus = programCompletionStatus;
    }
    
    public List<CompleteStageDTO> getStages() {
        return stages;
    }
    
    public void setStages(List<CompleteStageDTO> stages) {
        this.stages = stages;
    }
}