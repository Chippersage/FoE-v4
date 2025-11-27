package com.FlowofEnglish.dto;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProgramResponseDTO {
	 private String userId;
	    private ProgramDTO program;
	    
	 // Getters and Setters
		public String getUserId() {
			return userId;
		}
		public void setUserId(String userId) {
			this.userId = userId;
		}
		public ProgramDTO getProgram() {
			return program;
		}
		public void setProgram(ProgramDTO program) {
			this.program = program;
		}

	    
	    
}
