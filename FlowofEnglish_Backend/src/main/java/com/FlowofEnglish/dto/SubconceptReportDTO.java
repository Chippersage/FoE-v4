package com.FlowofEnglish.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SubconceptReportDTO {
	private String subconceptId;
    private String subconceptDesc;
    private boolean isCompleted;
    private double highestScore;
    private int attemptCount;
    private LocalDateTime lastAttemptDate;
    private String completionStatus;
    private List<AttemptDTO> attempts;
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
	public LocalDateTime getLastAttemptDate() {
		return lastAttemptDate;
	}
	public void setLastAttemptDate(LocalDateTime lastAttemptDate) {
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

}
