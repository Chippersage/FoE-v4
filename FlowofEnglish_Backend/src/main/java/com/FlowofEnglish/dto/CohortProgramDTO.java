package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;

    public class CohortProgramDTO {
	    private String cohortId;
	    private String cohortName;
	    private OffsetDateTime cohortStartDate;
	    private OffsetDateTime cohortEndDate;
	    private boolean showLeaderboard;
	    private boolean delayedStageUnlock;
	    private Integer delayInDays;
	    private boolean enableAiEvaluation;
	    private ProgramDTO program;
	    
	 // Getters and Setters
		public String getCohortId() {
			return cohortId;
		}
		public void setCohortId(String cohortId) {
			this.cohortId = cohortId;
		}
		public String getCohortName() {
			return cohortName;
		}
		public void setCohortName(String cohortName) {
			this.cohortName = cohortName;
		}
		public OffsetDateTime getCohortStartDate() {
			return cohortStartDate;
		}
		public void setCohortStartDate(OffsetDateTime cohortStartDate) {
			this.cohortStartDate = cohortStartDate;
		}
		public OffsetDateTime getCohortEndDate() {
			return cohortEndDate;
		}
		public void setCohortEndDate(OffsetDateTime cohortEndDate) {
			this.cohortEndDate = cohortEndDate;
		}
		public ProgramDTO getProgram() {
			return program;
		}
		public void setProgram(ProgramDTO program) {
			this.program = program;
		}
		public boolean isShowLeaderboard() {
			return showLeaderboard;
		}
		public void setShowLeaderboard(boolean showLeaderboard) {
			this.showLeaderboard = showLeaderboard;
		}
		public boolean isDelayedStageUnlock() {
			return delayedStageUnlock;
		}
		public void setDelayedStageUnlock(boolean delayedStageUnlock) {
			this.delayedStageUnlock = delayedStageUnlock;
		}
		public Integer getDelayInDays() {
			return delayInDays;
		}
		public void setDelayInDays(Integer delayInDays) {
			this.delayInDays = delayInDays;
		}
		public boolean isEnableAiEvaluation() {
			return enableAiEvaluation;
		}
		public void setEnableAiEvaluation(boolean enableAiEvaluation) {
			this.enableAiEvaluation = enableAiEvaluation;
		}

	    
}
