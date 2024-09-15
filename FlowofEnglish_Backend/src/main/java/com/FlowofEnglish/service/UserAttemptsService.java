package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserAttempts;
import java.util.List;
import java.util.Optional;

public interface UserAttemptsService {
    List<UserAttempts> getAllUserAttempts();
    Optional<UserAttempts> getUserAttemptById(int userAttemptId);
    UserAttempts createUserAttempt(UserAttempts userAttempt);
    UserAttempts updateUserAttempt(int userAttemptId, UserAttempts userAttempt);
    void deleteUserAttempt(int userAttemptId);
}
