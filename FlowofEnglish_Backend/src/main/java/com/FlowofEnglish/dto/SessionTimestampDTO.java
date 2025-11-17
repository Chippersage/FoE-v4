package com.FlowofEnglish.dto;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionTimestampDTO {
	
    private String sessionId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime sessionStartTimestamp;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime sessionEndTimestamp;
    
    public SessionTimestampDTO() {}

    public SessionTimestampDTO(String sessionId, OffsetDateTime sessionStartTimestamp, OffsetDateTime sessionEndTimestamp) {
        this.sessionId = sessionId;
        this.sessionStartTimestamp = sessionStartTimestamp;
        this.sessionEndTimestamp = sessionEndTimestamp;
    }
    
    // Getters and setters
	public String getSessionId() {
		return sessionId;
	}
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	public OffsetDateTime getSessionStartTimestamp() {
		return sessionStartTimestamp;
	}
	public void setSessionStartTimestamp(OffsetDateTime sessionStartTimestamp) {
		this.sessionStartTimestamp = sessionStartTimestamp;
	}
	public OffsetDateTime getSessionEndTimestamp() {
		return sessionEndTimestamp;
	}
	public void setSessionEndTimestamp(OffsetDateTime sessionEndTimestamp) {
		this.sessionEndTimestamp = sessionEndTimestamp;
	}
    
    
}