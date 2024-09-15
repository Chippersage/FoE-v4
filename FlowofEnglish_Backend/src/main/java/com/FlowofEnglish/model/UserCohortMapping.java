package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "UserCohortMapping")
public class UserCohortMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leaderboard_score")
    private int leaderboardScore;

    @Column(name = "uuid", length = 8, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor
    public UserCohortMapping() {
        
    }
    

    public UserCohortMapping(int leaderboardScore, String uuid, Cohort cohort, User user) {
		super();
		this.leaderboardScore = leaderboardScore;
		this.uuid = uuid;
		this.cohort = cohort;
		this.user = user;
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

    @Override
    public String toString() {
        return "UserCohortMapping{" +
                "leaderboardScore=" + leaderboardScore +
                ", uuid='" + uuid + '\'' +
                ", cohort=" + cohort +
                ", user=" + user +
                '}';
    }
 // Method to ensure UUID and generate leaderboardScore before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
