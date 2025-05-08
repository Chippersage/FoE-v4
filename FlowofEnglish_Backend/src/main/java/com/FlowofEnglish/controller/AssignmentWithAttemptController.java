package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/assignment-with-attempt")
public class AssignmentWithAttemptController {

    private static final Logger logger = LoggerFactory.getLogger(AssignmentWithAttemptController.class);

    @Autowired
    private UserAssignmentAttemptTransactionalService transactionCoordinator;

    /**
     * Combined endpoint for assignment submission with attempt creation.
     * This ensures that both operations succeed or fail together.
     */
    @PostMapping("/submit")
    public ResponseEntity<UserAssignmentMinimalDTO> submitAssignmentWithAttempt(
            @RequestParam("userId") String userId,
            @RequestParam("cohortId") String cohortId,
            @RequestParam("programId") String programId,
            @RequestParam("stageId") String stageId,
            @RequestParam("unitId") String unitId,
            @RequestParam("subconceptId") String subconceptId,
            @RequestParam("sessionId") String sessionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("userAttemptStartTimestamp") String userAttemptStartTimestamp,
            @RequestParam("userAttemptEndTimestamp") String userAttemptEndTimestamp,
            @RequestParam("userAttemptScore") Integer userAttemptScore,
            @RequestParam("userAttemptFlag") Boolean userAttemptFlag) throws IOException {

        logger.info("Received assignment submission request with attempt for userId: {}", userId);

        try {
            // Convert the request parameters to UserAttemptRequestDTO
            UserAttemptRequestDTO attemptRequestDTO = new UserAttemptRequestDTO();
            attemptRequestDTO.setUserId(userId);
            attemptRequestDTO.setProgramId(programId);
            attemptRequestDTO.setStageId(stageId);
            attemptRequestDTO.setUnitId(unitId);
            attemptRequestDTO.setSubconceptId(subconceptId);
            attemptRequestDTO.setSessionId(sessionId);
            attemptRequestDTO.setUserAttemptStartTimestamp(LocalDateTime.parse(userAttemptStartTimestamp));
            attemptRequestDTO.setUserAttemptEndTimestamp(LocalDateTime.parse(userAttemptEndTimestamp));
            attemptRequestDTO.setUserAttemptScore(userAttemptScore);
            attemptRequestDTO.setUserAttemptFlag(userAttemptFlag);

            UserAssignment result = transactionCoordinator.processAssignmentWithAttempt(
                userId, cohortId, programId, stageId, unitId, subconceptId, sessionId, file, attemptRequestDTO);

            UserAssignmentMinimalDTO dto = transactionCoordinator.toMinimalDTO(result);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Failed to process assignment with attempt: {}", e.getMessage(), e);
            throw e; // Let the global exception handler take care of it
        }
    }
}