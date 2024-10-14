package com.FlowofEnglish.model;

import jakarta.persistence.*;

//import java.io.Serializable;
import java.util.UUID;

@Entity
//@IdClass(UserCohortMappingId.class)
@Table(name = "UserCohortMapping")
public class UserCohortMapping  {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_cohort_id", nullable = false, unique = true)
    private int userCohortId;
	
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
	
	@Column(name = "leaderboard_score")
    private int leaderboardScore;
	
	
    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    
    // Default constructor
    public UserCohortMapping() {
        
    }
  
    public UserCohortMapping(int userCohortId, User user, int leaderboardScore, String uuid, Cohort cohort) {
		super();
		this.userCohortId = userCohortId;
		this.user = user;
		this.leaderboardScore = leaderboardScore;
		this.uuid = uuid;
		this.cohort = cohort;
	}


	// Getters and Setters
    public int getLeaderboardScore() {
        return leaderboardScore;
    }

    public void setLeaderboardScore(int leaderboardScore) {
        this.leaderboardScore = leaderboardScore;
    }
    public String getUuid() {
        return uuid;
    }
    public void setUuid(String uuid) {
		this.uuid = uuid;
	}


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

    public int getUserCohortId() {
		return userCohortId;
	}
    
    public void setUserCohortId(int userCohortId) {
		this.userCohortId = userCohortId;
	}

	@Override
	public String toString() {
		return "UserCohortMapping [userCohortId=" + userCohortId + ", user=" + user + ", leaderboardScore="
				+ leaderboardScore + ", uuid=" + uuid + ", cohort=" + cohort + "]";
	}

	// Method to ensure UUID and generate leaderboardScore before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
