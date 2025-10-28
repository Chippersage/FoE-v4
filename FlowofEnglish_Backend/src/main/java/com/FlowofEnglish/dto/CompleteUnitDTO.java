package com.FlowofEnglish.dto;

import java.util.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompleteUnitDTO {
    private String unitId;
    private String unitName;
    private String unitDesc;
    private String completionStatus;
    private List<SubconceptResponseDTO> subconcepts;
    
    // Getters and Setters
    public String getUnitId() {
        return unitId;
    }
    
    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }
    
    public String getUnitName() {
        return unitName;
    }
    
    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }
    
    public String getUnitDesc() {
        return unitDesc;
    }
    
    public void setUnitDesc(String unitDesc) {
        this.unitDesc = unitDesc;
    }
    
    public String getCompletionStatus() {
        return completionStatus;
    }
    
    public void setCompletionStatus(String completionStatus) {
        this.completionStatus = completionStatus;
    }
    
    public List<SubconceptResponseDTO> getSubconcepts() {
        return subconcepts;
    }
    
    public void setSubconcepts(List<SubconceptResponseDTO> subconcepts) {
        this.subconcepts = subconcepts;
    }
}