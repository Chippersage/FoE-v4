package com.FlowofEnglish.dto;

import com.FlowofEnglish.model.User;

public class UsercreateDTO {
	private User user;
    private String cohortId;
    
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public String getCohortId() {
		return cohortId;
	}
	public void setCohortId(String cohortId) {
		this.cohortId = cohortId;
	}
    
    

}
