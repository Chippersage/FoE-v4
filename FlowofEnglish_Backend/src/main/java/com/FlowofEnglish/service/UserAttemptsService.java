package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserAttempts;
import java.util.List;
import java.util.Optional;

public interface UserAttemptsService {
    List<UserAttempts> getAllUserAttempts();
    Optional<UserAttempts> getUserAttemptById(Long userAttemptId);
    UserAttempts saveUserAttempt(UserAttempts userAttempt); 
    UserAttempts createUserAttempt(UserAttempts userAttempt, String cohortId);
    UserAttempts updateUserAttempt(Long userAttemptId, UserAttempts userAttempt);
    void deleteUserAttempt(Long userAttemptId);
}
