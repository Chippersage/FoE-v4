//package com.FlowofEnglish.model;
//
//import java.io.Serializable;
//import java.util.Objects;
//
//public class UserCohortMappingId implements Serializable {
//    private User user;
//    private Cohort cohort;
//
//    // Default constructor
//    public UserCohortMappingId() {}
//
//    // Constructor with parameters
//    public UserCohortMappingId(User user, Cohort cohort) {
//        this.user = user;
//        this.cohort = cohort;
//    }
//    
//    // Getters and setters
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public Cohort getCohort() {
//        return cohort;
//    }
//
//    public void setCohort(Cohort cohort) {
//        this.cohort = cohort;
//    }
//    
//    // hashCode and equals
//    @Override
//    public int hashCode() {
//        return Objects.hash(cohort, user);
//    }
//
//    @Override
//    public boolean equals(Object obj) {
//        if (this == obj)
//            return true;
//        if (obj == null)
//            return false;
//        if (getClass() != obj.getClass())
//            return false;
//        UserCohortMappingId other = (UserCohortMappingId) obj;
//        return Objects.equals(cohort, other.cohort) && Objects.equals(user, other.user);
//    }
//}
