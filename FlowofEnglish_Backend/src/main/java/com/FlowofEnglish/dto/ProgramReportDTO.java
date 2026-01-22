package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramReportDTO {
    private String programId;
    private String programName;
    private String programDesc;
    private int totalStages;
    private int completedStages;
    private int totalUnits;
    private int completedUnits;
    private int totalSubconcepts;
    private int completedSubconcepts;
    private int totalAssignments;
    private int completedAssignments;
    private double stageCompletionPercentage;
    private double unitCompletionPercentage;
    private double subconceptCompletionPercentage;
    private double assignmentCompletionPercentage;
    private double averageScore;
    private int totalScore;           // Sum of all subconceptMaxscore values for ALL visible subconcepts
    private int attemptedMaxScore;    // Sum of subconceptMaxscore for ONLY attempted subconcepts
    private int gotScore;             // Sum of best attempt scores across attempted subconcepts
    private double overallPercentageScore;  // (gotScore / totalScore) * 100
    private double attemptedPercentageScore; // (gotScore / attemptedMaxScore) * 100
    private OffsetDateTime firstAttemptDate;  
    private OffsetDateTime lastAttemptDate;  
    private List<StageReportDTO> stages;
    private Map<String, Integer> scoreDistribution;
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
	public int getTotalStages() {
		return totalStages;
	}
	public void setTotalStages(int totalStages) {
		this.totalStages = totalStages;
	}
	public int getCompletedStages() {
		return completedStages;
	}
	public void setCompletedStages(int completedStages) {
		this.completedStages = completedStages;
	}
	public int getTotalUnits() {
		return totalUnits;
	}
	public void setTotalUnits(int totalUnits) {
		this.totalUnits = totalUnits;
	}
	public int getCompletedUnits() {
		return completedUnits;
	}
	public void setCompletedUnits(int completedUnits) {
		this.completedUnits = completedUnits;
	}
	public int getTotalSubconcepts() {
		return totalSubconcepts;
	}
	public void setTotalSubconcepts(int totalSubconcepts) {
		this.totalSubconcepts = totalSubconcepts;
	}
	public int getCompletedSubconcepts() {
		return completedSubconcepts;
	}
	public void setCompletedSubconcepts(int completedSubconcepts) {
		this.completedSubconcepts = completedSubconcepts;
	}
	public int getTotalAssignments() {
		return totalAssignments;
	}
	public void setTotalAssignments(int totalAssignments) {
		this.totalAssignments = totalAssignments;
	}
	public int getCompletedAssignments() {
		return completedAssignments;
	}
	public void setCompletedAssignments(int completedAssignments) {
		this.completedAssignments = completedAssignments;
	}
	public double getStageCompletionPercentage() {
		return stageCompletionPercentage;
	}
	public void setStageCompletionPercentage(double stageCompletionPercentage) {
		this.stageCompletionPercentage = stageCompletionPercentage;
	}
	public double getUnitCompletionPercentage() {
		return unitCompletionPercentage;
	}
	public void setUnitCompletionPercentage(double unitCompletionPercentage) {
		this.unitCompletionPercentage = unitCompletionPercentage;
	}
	public double getSubconceptCompletionPercentage() {
		return subconceptCompletionPercentage;
	}
	public void setSubconceptCompletionPercentage(double subconceptCompletionPercentage) {
		this.subconceptCompletionPercentage = subconceptCompletionPercentage;
	}
	public double getAssignmentCompletionPercentage() {
		return assignmentCompletionPercentage;
	}
	public void setAssignmentCompletionPercentage(double assignmentCompletionPercentage) {
		this.assignmentCompletionPercentage = assignmentCompletionPercentage;
	}
	public double getAverageScore() {
		return averageScore;
	}
	public void setAverageScore(double averageScore) {
		this.averageScore = averageScore;
	}
	public int getTotalScore() {
		return totalScore;
	}
	public void setTotalScore(int totalScore) {
		this.totalScore = totalScore;
	}
	public int getAttemptedMaxScore() {
		return attemptedMaxScore;
	}
	public void setAttemptedMaxScore(int attemptedMaxScore) {
		this.attemptedMaxScore = attemptedMaxScore;
	}
	public int getGotScore() {
		return gotScore;
	}
	public void setGotScore(int gotScore) {
		this.gotScore = gotScore;
	}
	public double getOverallPercentageScore() {
		return overallPercentageScore;
	}
	public void setOverallPercentageScore(double overallPercentageScore) {
		this.overallPercentageScore = overallPercentageScore;
	}
	public double getAttemptedPercentageScore() {
		return attemptedPercentageScore;
	}
	public void setAttemptedPercentageScore(double attemptedPercentageScore) {
		this.attemptedPercentageScore = attemptedPercentageScore;
	}
	public OffsetDateTime getFirstAttemptDate() {
		return firstAttemptDate;
	}
	public void setFirstAttemptDate(OffsetDateTime firstAttemptDate) {
		this.firstAttemptDate = firstAttemptDate;
	}
	public OffsetDateTime getLastAttemptDate() {
		return lastAttemptDate;
	}
	public void setLastAttemptDate(OffsetDateTime lastAttemptDate) {
		this.lastAttemptDate = lastAttemptDate;
	}
	public List<StageReportDTO> getStages() {
		return stages;
	}
	public void setStages(List<StageReportDTO> stages) {
		this.stages = stages;
	}
	public Map<String, Integer> getScoreDistribution() {
		return scoreDistribution;
	}
	public void setScoreDistribution(Map<String, Integer> scoreDistribution) {
		this.scoreDistribution = scoreDistribution;
	}
    
    
	
    
}
