package com.FlowofEnglish.dto;

import java.util.Map;

public class ProgramConceptsMappingResponseDTO {
    private String programId;
    private String unitId;  // Changed from unit_id to unitId
    private String stageId; 
    private Map<String, SubconceptResponseDTO> subConcepts; // Changed from sub_concepts to subConcepts
    private String unitCompletionStatus; // Changed from unit_completion_status to unitCompletionStatus
    private int subconceptCount;

  
    // Getters and Setters
    public String getProgramId() {
        return programId;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getStageId() {
        return stageId;
    }

    public void setStageId(String stageId) {
        this.stageId = stageId;
    }

    public Map<String, SubconceptResponseDTO> getSubConcepts() {
        return subConcepts;
    }

    public void setSubConcepts(Map<String, SubconceptResponseDTO> subConcepts) {
        this.subConcepts = subConcepts;
    }

    public String getUnitCompletionStatus() {
        return unitCompletionStatus;
    }

    public void setUnitCompletionStatus(String unitCompletionStatus) {
        this.unitCompletionStatus = unitCompletionStatus;
    }

    public int getSubconceptCount() {
        return subconceptCount;
    }

    public void setSubconceptCount(int subconceptCount) {
        this.subconceptCount = subconceptCount;
    }
}
