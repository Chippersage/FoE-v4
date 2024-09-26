package com.FlowofEnglish.dto;

import java.util.Map;

public class ProgramConceptsMappingResponseDTO {
    private String programId;
    private String unit_id;
    private String stageId;  // Add stageId
    private Map<String, SubconceptResponseDTO> sub_concepts;
    private String unit_completion_status;
    private int subconceptCount;

   

    // Getters and Setters

    public String getProgramId() {
        return programId;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public String getUnit_id() {
        return unit_id;
    }

    public void setUnit_id(String unit_id) {
        this.unit_id = unit_id;
    }
    

    public String getStageId() {
		return stageId;
	}

	public void setStageId(String stageId) {
		this.stageId = stageId;
	}

	public Map<String, SubconceptResponseDTO> getSub_concepts() {
        return sub_concepts;
    }

    public void setSub_concepts(Map<String, SubconceptResponseDTO> sub_concepts) {
        this.sub_concepts = sub_concepts;
    }

    public String getUnit_completion_status() {
        return unit_completion_status;
    }

    public void setUnit_completion_status(String unit_completion_status) {
        this.unit_completion_status = unit_completion_status;
    }
    public int getSubconceptCount() {
        return subconceptCount;
    }

    public void setSubconceptCount(int subconceptCount) {
        this.subconceptCount = subconceptCount;
    }
}
