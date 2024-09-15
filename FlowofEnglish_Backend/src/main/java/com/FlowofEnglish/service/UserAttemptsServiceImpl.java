package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserAttempts;
import com.FlowofEnglish.repository.UserAttemptsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserAttemptsServiceImpl implements UserAttemptsService {

    @Autowired
    private UserAttemptsRepository userAttemptsRepository;

    @Override
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsRepository.findAll();
    }

    @Override
    public Optional<UserAttempts> getUserAttemptById(int userAttemptId) {
        return userAttemptsRepository.findById(userAttemptId);
    }

    @Override
    public UserAttempts createUserAttempt(UserAttempts userAttempt) {
        return userAttemptsRepository.save(userAttempt);
    }

    @Override
    public UserAttempts updateUserAttempt(int userAttemptId, UserAttempts userAttempt) {
        return userAttemptsRepository.findById(userAttemptId).map(existingAttempt -> {
            existingAttempt.setUserAttemptEndTimestamp(userAttempt.getUserAttemptEndTimestamp());
            existingAttempt.setUserAttemptFlag(userAttempt.isUserAttemptFlag());
            existingAttempt.setUserAttemptScore(userAttempt.getUserAttemptScore());
            existingAttempt.setUserAttemptStartTimestamp(userAttempt.getUserAttemptStartTimestamp());
            existingAttempt.setConcept(userAttempt.getConcept());
            existingAttempt.setUnit(userAttempt.getUnit());
            existingAttempt.setProgram(userAttempt.getProgram());
            existingAttempt.setSession(userAttempt.getSession());
            existingAttempt.setSubconcept(userAttempt.getSubconcept());
            existingAttempt.setUuid(userAttempt.getUuid());
            return userAttemptsRepository.save(existingAttempt);
        }).orElseThrow(() -> new RuntimeException("UserAttempt not found"));
    }

    @Override
    public void deleteUserAttempt(int userAttemptId) {
        userAttemptsRepository.deleteById(userAttemptId);
    }
}
