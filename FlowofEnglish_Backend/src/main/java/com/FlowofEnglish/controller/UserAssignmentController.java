package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.MediaFile;
import com.FlowofEnglish.model.UserAssignment;
import com.FlowofEnglish.service.UserAssignmentService;
import java.nio.file.Path;
import java.nio.file.Paths;

//import jakarta.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;


import java.io.IOException;
// import java.net.http.HttpHeaders;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
public class UserAssignmentController {

    @Autowired
    private UserAssignmentService userAssignmentService;

    @PostMapping("/submit")
    public ResponseEntity<UserAssignment> submitAssignment(
            @RequestParam("userId") String userId,
            @RequestParam("cohortId") String cohortId,
            @RequestParam("programId") String programId,
            @RequestParam("stageId") String stageId,
            @RequestParam("unitId") String unitId,
            @RequestParam("subconceptId") String subconceptId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(userAssignmentService.submitNewAssignment(
            userId, cohortId, programId, stageId, unitId, subconceptId, file));
    }


    @PostMapping("/{assignmentId}/correct")
    public ResponseEntity<UserAssignment> submitCorrectedAssignment(
            @PathVariable String assignmentId,
            @RequestParam("score") Integer score,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(userAssignmentService.submitCorrectedAssignment(
            assignmentId, score, file));
    }
    
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAssignment>> getAssignmentsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentsByUserId(userId));
    }

    @GetMapping("/cohort/{cohortId}")
    public ResponseEntity<List<UserAssignment>> getAssignmentsByCohortId(@PathVariable String cohortId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentsByCohortId(cohortId));
    }

    @GetMapping("/cohort/{cohortId}/user/{userId}")
    public ResponseEntity<List<UserAssignment>> getAssignmentsByCohortIdAndUserId(@PathVariable String cohortId, @PathVariable String userId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentsByCohortIdAndUserId(cohortId, userId));
    }
    
    @GetMapping("/bulk-download")
    public ResponseEntity<Resource> downloadAllAssignments(
            @RequestParam("cohortId") String cohortId) throws IOException {
        Resource zipResource = userAssignmentService.downloadAllAssignments(cohortId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignments.zip\"")
                .body(zipResource);
    }
    
    @GetMapping("/bulk-download-send")
    public ResponseEntity<Resource> downloadAllAssignmentsSendEmail(
            @RequestParam("cohortId") String cohortId) throws IOException {
    	Resource zipResource = userAssignmentService.downloadAllAssignmentsSendEmail(cohortId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignments.zip\"")
                .body(zipResource);
    }
    
    @PostMapping("/bulk-upload-corrected")
    public ResponseEntity<String> uploadCorrectedAssignments(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("scores") List<Integer> scores,
            @RequestParam("remarks") List<String> remarks,
            @RequestParam("assignmentIds") List<String> assignmentIds) throws IOException {
        if (files.size() != scores.size() || scores.size() != remarks.size() || remarks.size() != assignmentIds.size()) {
            return ResponseEntity.badRequest().body("Mismatched number of files, scores, remarks, and assignment IDs.");
        }
        userAssignmentService.uploadCorrectedAssignments(files, scores, remarks, assignmentIds);
        return ResponseEntity.ok("Corrected assignments uploaded successfully.");
    }



    @GetMapping("/{assignmentId}/file")
    public ResponseEntity<Resource> getSubmittedFile(@PathVariable String assignmentId) {
        MediaFile file = userAssignmentService.getSubmittedFile(assignmentId);
        Path filePath = Paths.get(file.getFilePath()); // Assuming the file is saved on the disk
        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }
    
    @GetMapping("/{assignmentId}/corrected-file")
    public ResponseEntity<Resource> getCorrectedFile(@PathVariable String assignmentId) {
        MediaFile file = userAssignmentService.getCorrectedFile(assignmentId);
        Path filePath = Paths.get(file.getFilePath());
        Resource resource = new FileSystemResource(filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<UserAssignment> getAssignmentById(@PathVariable String assignmentId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentById(assignmentId));
    }
}
