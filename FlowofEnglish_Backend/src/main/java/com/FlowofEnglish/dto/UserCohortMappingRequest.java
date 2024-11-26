package com.FlowofEnglish.dto;

import com.FlowofEnglish.model.Cohort;
import com.FlowofEnglish.model.User;

public class UserCohortMappingRequest {
    private Cohort cohort;
    private User user;

    // Getters and setters
    public Cohort getCohort() {
        return cohort;
    }

    public void setCohort(Cohort cohort) {
        this.cohort = cohort;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}


