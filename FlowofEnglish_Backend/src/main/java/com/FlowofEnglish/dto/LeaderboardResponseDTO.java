package com.FlowofEnglish.dto;

import java.util.List;

public class LeaderboardResponseDTO {
    private String leaderboardStatus;
    private String message;
    private List<UserCohortMappingDTO> leaderboardData;

    // Default constructor
    public LeaderboardResponseDTO() {}

    // Full constructor
    public LeaderboardResponseDTO(String leaderboardStatus, String message, List<UserCohortMappingDTO> leaderboardData) {
        this.leaderboardStatus = leaderboardStatus;
        this.message = message;
        this.leaderboardData = leaderboardData;
    }

    // Factory method for success with data
    public static LeaderboardResponseDTO available(List<UserCohortMappingDTO> data) {
        return new LeaderboardResponseDTO("available", "Leaderboard is available for this cohort", data);
    }

    // Factory method for not available
    public static LeaderboardResponseDTO notAvailable(String message) {
        return new LeaderboardResponseDTO("not available", message, null);
    }

    // Factory method for error
    public static LeaderboardResponseDTO error(String message) {
        return new LeaderboardResponseDTO("error", message, null);
    }

    // Getters and setters
    public String getLeaderboardStatus() { 
        return leaderboardStatus; 
    }
    
    public void setLeaderboardStatus(String leaderboardStatus) { 
        this.leaderboardStatus = leaderboardStatus; 
    }

    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }

    public List<UserCohortMappingDTO> getLeaderboardData() { 
        return leaderboardData; 
    }
    
    public void setLeaderboardData(List<UserCohortMappingDTO> leaderboardData) { 
        this.leaderboardData = leaderboardData; 
    }
}