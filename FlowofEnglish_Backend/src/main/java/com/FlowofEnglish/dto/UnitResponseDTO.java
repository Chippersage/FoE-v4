package com.FlowofEnglish.dto;

public class UnitResponseDTO {

    private String unitId;
    private ProgramDTO program;
    private StageDTO stage;
    private String unitDesc;
    private String unitName;
    private String CompletionStatus;
public String getCompletionStatus() {
		return CompletionStatus;
	}
	public void setCompletionStatus(String completionStatus) {
		CompletionStatus = completionStatus;
	}
	//    private String userId;
//    public String getUserId() {
//		return userId;
//	}
//	public void setUserId(String userId) {
//		this.userId = userId;
//	}
	private UserDTO user;
    
	public UserDTO getUser() {
		return user;
	}
	public void setUser(UserDTO user) {
		this.user = user;
	}
	public String getUnitId() {
		return unitId;
	}
	public void setUnitId(String unitId) {
		this.unitId = unitId;
	}
	public ProgramDTO getProgram() {
		return program;
	}
	public void setProgram(ProgramDTO program) {
		this.program = program;
	}
	public StageDTO getStage() {
		return stage;
	}
	public void setStage(StageDTO stage) {
		this.stage = stage;
	}
	public String getUnitDesc() {
		return unitDesc;
	}
	public void setUnitDesc(String unitDesc) {
		this.unitDesc = unitDesc;
	}
	public String getUnitName() {
		return unitName;
	}
	public void setUnitName(String unitName) {
		this.unitName = unitName;
	}

    
    // Getters and Setters
}