package com.FlowofEnglish.service;

import com.FlowofEnglish.model.MediaFile;
import com.FlowofEnglish.model.UserAssignment;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserAssignmentService {

   // UserAssignment createAssignment(UserAssignment userAssignment);

    List<UserAssignment> getAssignmentsByUserId(String userId);

    List<UserAssignment> getAssignmentsByCohortId(String cohortId);

    List<UserAssignment> getAssignmentsByCohortIdAndUserId(String cohortId, String userId);

    UserAssignment submitNewAssignment(String userId, String cohortId, String programId, 
            String stageId, String unitId, String subconceptId, 
            MultipartFile file) throws IOException;

UserAssignment submitCorrectedAssignment(Long assignmentId, Integer score, 
                  MultipartFile correctedFile) throws IOException;

    UserAssignment getAssignmentById(Long assignmentId);
    MediaFile getSubmittedFile(Long assignmentId); // Add this line
    MediaFile getCorrectedFile(Long assignmentId);
}
