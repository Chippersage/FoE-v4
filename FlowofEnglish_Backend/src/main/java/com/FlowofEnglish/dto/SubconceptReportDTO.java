package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubconceptReportDTO {
	private String subconceptId;
    private String subconceptDesc;
    private String dependency;
	private Integer subconceptMaxscore;
	private Integer numQuestions;
    private String showTo;
	private String subconceptGroup;
	private String subconceptDesc2;
	private String subconceptType;
    private boolean isCompleted;
    private double highestScore;
    private int attemptCount;
    private OffsetDateTime lastAttemptDate;
    private String completionStatus;
    private List<AttemptDTO> attempts;
    
    private ConceptDTO concept;
 //   private ContentDTO content;
    
 // Getters and Setters
    
	public String getSubconceptId() {
		return subconceptId;
	}
	public void setSubconceptId(String subconceptId) {
		this.subconceptId = subconceptId;
	}
	public String getSubconceptDesc() {
		return subconceptDesc;
	}
	public void setSubconceptDesc(String subconceptDesc) {
		this.subconceptDesc = subconceptDesc;
	}
	public String getDependency() {
		return dependency;
	}
	public void setDependency(String dependency) {
		this.dependency = dependency;
	}
	public Integer getSubconceptMaxscore() {
		return subconceptMaxscore;
	}
	public void setSubconceptMaxscore(Integer subconceptMaxscore) {
		this.subconceptMaxscore = subconceptMaxscore;
	}
	public Integer getNumQuestions() {
		return numQuestions;
	}
	public void setNumQuestions(Integer numQuestions) {
		this.numQuestions = numQuestions;
	}
	public String getShowTo() {
		return showTo;
	}
	public void setShowTo(String showTo) {
		this.showTo = showTo;
	}
	public String getSubconceptGroup() {
		return subconceptGroup;
	}
	public void setSubconceptGroup(String subconceptGroup) {
		this.subconceptGroup = subconceptGroup;
	}
	public String getSubconceptDesc2() {
		return subconceptDesc2;
	}
	public void setSubconceptDesc2(String subconceptDesc2) {
		this.subconceptDesc2 = subconceptDesc2;
	}
	public String getSubconceptType() {
		return subconceptType;
	}
	public void setSubconceptType(String subconceptType) {
		this.subconceptType = subconceptType;
	}
	public boolean isCompleted() {
		return isCompleted;
	}
	public void setCompleted(boolean isCompleted) {
		this.isCompleted = isCompleted;
	}
	public double getHighestScore() {
		return highestScore;
	}
	public void setHighestScore(double highestScore) {
		this.highestScore = highestScore;
	}
	public int getAttemptCount() {
		return attemptCount;
	}
	public void setAttemptCount(int attemptCount) {
		this.attemptCount = attemptCount;
	}
	public OffsetDateTime getLastAttemptDate() {
		return lastAttemptDate;
	}
	public void setLastAttemptDate(OffsetDateTime lastAttemptDate) {
		this.lastAttemptDate = lastAttemptDate;
	}
	public String getCompletionStatus() {
		return completionStatus;
	}
	public void setCompletionStatus(String completionStatus) {
		this.completionStatus = completionStatus;
	}
	public List<AttemptDTO> getAttempts() {
		return attempts;
	}
	public void setAttempts(List<AttemptDTO> attempts) {
		this.attempts = attempts;
	}
	public ConceptDTO getConcept() {
		return concept;
	}
	public void setConcept(ConceptDTO concept) {
		this.concept = concept;
	}
//	public ContentDTO getContent() {
//		return content;
//	}
//	public void setContent(ContentDTO content) {
//		this.content = content;
//	}

}
