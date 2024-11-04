package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.UserAttemptRequestDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.model.Subconcept;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.model.User;
import com.FlowofEnglish.model.UserAttempts;
import com.FlowofEnglish.model.UserSessionMapping;
import com.FlowofEnglish.service.ProgramService;
import com.FlowofEnglish.service.StageService;
import com.FlowofEnglish.service.SubconceptService;
import com.FlowofEnglish.service.UnitService;
import com.FlowofEnglish.service.UserAttemptsService;
import com.FlowofEnglish.service.UserService;
import com.FlowofEnglish.service.UserSessionMappingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/user-attempts")
public class UserAttemptsController {
	
	@Autowired
    private UserAttemptsService userAttemptsService;

	@Autowired
    private UserService userService;

    @Autowired
    private UnitService unitService;

    @Autowired
    private ProgramService programService;

    @Autowired
    private StageService stageService;

    @Autowired
    private UserSessionMappingService userSessionMappingService;

    @Autowired
    private SubconceptService subconceptService;

    @PostMapping
    public ResponseEntity<?> createUserAttempt(@RequestBody UserAttemptRequestDTO requestDTO) {
        // Fetch related entities based on IDs
        Optional<User> userOpt = userService.findByUserId(requestDTO.getUserId());
        Optional<Unit> unitOpt = unitService.findByUnitId(requestDTO.getUnitId());
        Optional<Program> programOpt = programService.findByProgramId(requestDTO.getProgramId());
        Optional<Stage> stageOpt = stageService.findByStageId(requestDTO.getStageId());
        Optional<UserSessionMapping> sessionOpt = userSessionMappingService.findBySessionId(requestDTO.getSessionId());
        Optional<Subconcept> subconceptOpt = subconceptService.findBySubconceptId(requestDTO.getSubconceptId());

        // Validate all entities are present
        if (!userOpt.isPresent() || !unitOpt.isPresent() || !programOpt.isPresent() ||
                !stageOpt.isPresent() || !sessionOpt.isPresent() || !subconceptOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid data provided. Please check all IDs.");
        }

        // Create UserAttempts entity
        UserAttempts userAttempt = new UserAttempts();
        userAttempt.setUserAttemptEndTimestamp(requestDTO.getUserAttemptEndTimestamp());
        userAttempt.setUserAttemptFlag(requestDTO.isUserAttemptFlag());
        userAttempt.setUserAttemptScore(requestDTO.getUserAttemptScore());
        userAttempt.setUserAttemptStartTimestamp(requestDTO.getUserAttemptStartTimestamp());
        userAttempt.setUser(userOpt.get());
        userAttempt.setUnit(unitOpt.get());
        userAttempt.setProgram(programOpt.get());
        userAttempt.setStage(stageOpt.get());
        userAttempt.setSession(sessionOpt.get());
        userAttempt.setSubconcept(subconceptOpt.get());
        // UUID will be generated automatically via @PrePersist

        // Create the user attempt
        try {
            UserAttempts createdAttempt = userAttemptsService.createUserAttempt(userAttempt, requestDTO.getCohortId());
            return new ResponseEntity<>(createdAttempt, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating the user attempt.");
        }
    }
    
    
    @GetMapping
    public List<UserAttempts> getAllUserAttempts() {
        return userAttemptsService.getAllUserAttempts();
    }

    
    @GetMapping("/{userAttemptId}")
    public ResponseEntity<UserAttempts> getUserAttemptById(@PathVariable Long userAttemptId) {
        Optional<UserAttempts> userAttempt = userAttemptsService.getUserAttemptById(userAttemptId);
        return userAttempt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    

    @PutMapping("/{userAttemptId}")
    public ResponseEntity<UserAttempts> updateUserAttempt(@PathVariable Long userAttemptId, @RequestBody UserAttempts userAttempt) {
        return ResponseEntity.ok(userAttemptsService.updateUserAttempt(userAttemptId, userAttempt));
    }

    @DeleteMapping("/{userAttemptId}")
    public ResponseEntity<Void> deleteUserAttempt(@PathVariable Long userAttemptId) {
        userAttemptsService.deleteUserAttempt(userAttemptId);
        return ResponseEntity.noContent().build();
    }
}
