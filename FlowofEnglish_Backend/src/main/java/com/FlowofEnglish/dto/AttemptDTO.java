package com.FlowofEnglish.dto;

import java.time.LocalDateTime;

public class AttemptDTO {
	private Long attemptId;
    private LocalDateTime startTimestamp;
    private LocalDateTime endTimestamp;
    private int score;
    private boolean isSuccessful;
	public Long getAttemptId() {
		return attemptId;
	}
	public void setAttemptId(Long attemptId) {
		this.attemptId = attemptId;
	}
	public LocalDateTime getStartTimestamp() {
		return startTimestamp;
	}
	public void setStartTimestamp(LocalDateTime startTimestamp) {
		this.startTimestamp = startTimestamp;
	}
	public LocalDateTime getEndTimestamp() {
		return endTimestamp;
	}
	public void setEndTimestamp(LocalDateTime endTimestamp) {
		this.endTimestamp = endTimestamp;
	}
	public int getScore() {
		return score;
	}
	public void setScore(int score) {
		this.score = score;
	}
	public boolean isSuccessful() {
		return isSuccessful;
	}
	public void setSuccessful(boolean isSuccessful) {
		this.isSuccessful = isSuccessful;
	}
    
    

}
