package com.FlowofEnglish.service;

import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserSubConceptServiceImpl implements UserSubConceptService {

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;

    @Override
    public UserSubConcept createUserSubConcept(UserSubConcept userSubConcept) {
        return userSubConceptRepository.save(userSubConcept);
    }

    @Override
    public UserSubConcept getUserSubConceptById(Long userSubconceptId) {
        Optional<UserSubConcept> userSubConcept = userSubConceptRepository.findById(userSubconceptId);
        return userSubConcept.orElse(null);
    }

    @Override
    public List<UserSubConcept> getAllUserSubConcepts() {
        return userSubConceptRepository.findAll();
    }

    @Override
    public UserSubConcept updateUserSubConcept(Long userSubconceptId, UserSubConcept userSubConcept) {
        if (userSubConceptRepository.existsById(userSubconceptId)) {
            userSubConcept.setUserSubconceptId(userSubconceptId);
            return userSubConceptRepository.save(userSubConcept);
        }
        return null;
    }

    @Override
    public void deleteUserSubConcept(Long userSubconceptId) {
        userSubConceptRepository.deleteById(userSubconceptId);
    }
}
