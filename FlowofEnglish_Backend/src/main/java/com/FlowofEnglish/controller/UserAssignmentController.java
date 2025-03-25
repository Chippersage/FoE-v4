package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.MediaFile;
import com.FlowofEnglish.model.UserAssignment;
import com.FlowofEnglish.service.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

//import jakarta.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
// import java.net.http.HttpHeaders;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assignments")
public class UserAssignmentController {

    @Autowired
    private UserAssignmentService userAssignmentService;
    
    @Autowired
    private S3StorageService s3StorageService;

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
            @RequestParam(value = "score", required = false) Integer score,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "correctedDate", required = false) String correctedDateStr,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

    	DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    	OffsetDateTime correctedDate = (correctedDateStr != null) 
    	    ? OffsetDateTime.parse(correctedDateStr, formatter) 
    	    : null;

        return ResponseEntity.ok(userAssignmentService.submitCorrectedAssignment(
            assignmentId, score, file, remarks, correctedDate));
    }

    
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAssignment>> getAssignmentsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentsByUserId(userId));
    }

//    @GetMapping("/cohort/{cohortId}")
//    public ResponseEntity<List<UserAssignment>> getAssignmentsByCohortId(@PathVariable String cohortId) {
//        return ResponseEntity.ok(userAssignmentService.getAssignmentsByCohortId(cohortId));
//    }
    @GetMapping("/cohort/{cohortId}")
    public ResponseEntity<List<Map<String, Object>>> getAssignmentsByCohortId(@PathVariable String cohortId) {
        List<UserAssignment> assignments = userAssignmentService.getAssignmentsByCohortId(cohortId);
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (UserAssignment assignment : assignments) {
            Map<String, Object> assignmentData = new HashMap<>();
            
            // Add basic assignment info
            assignmentData.put("assignmentId", assignment.getAssignmentId());
            assignmentData.put("submittedDate", assignment.getSubmittedDate());
            assignmentData.put("correctedDate", assignment.getCorrectedDate());
            assignmentData.put("score", assignment.getScore());
            assignmentData.put("remarks", assignment.getRemarks());
            
            // Add user info
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", assignment.getUser().getUserId());
            userData.put("userName", assignment.getUser().getUserName());
            assignmentData.put("user", userData);
            
            // Add program info
            Map<String, Object> programData = new HashMap<>();
            programData.put("programId", assignment.getProgram().getProgramId());
            programData.put("programName",assignment.getProgram().getProgramName());
            assignmentData.put("program", programData);
            
            // Add stage info
            Map<String, Object> stageData = new HashMap<>();
            stageData.put("stageId", assignment.getStage().getStageId());
            stageData.put("stageName", assignment.getStage().getStageName());
            assignmentData.put("stage", stageData);
            
            // Add unit info
            Map<String, Object> unitData = new HashMap<>();
            unitData.put("unitId", assignment.getUnit().getUnitId());
            assignmentData.put("unit", unitData);
            
            // Add subconcept info
            Map<String, Object> subconceptData = new HashMap<>();
            subconceptData.put("subconceptId", assignment.getSubconcept().getSubconceptId());
            subconceptData.put("subconceptDesc", assignment.getSubconcept().getSubconceptDesc());
            subconceptData.put("subconceptMaxscore", assignment.getSubconcept().getSubconceptMaxscore());
            assignmentData.put("subconcept", subconceptData);
            
            // Add submitted file info with public S3 URL
            if (assignment.getSubmittedFile() != null) {
                MediaFile submittedFile = assignment.getSubmittedFile();
                // Ensure file is publicly accessible
                s3StorageService.makeFilePublic(submittedFile.getFilePath());
                // Generate public URL
                String publicUrl = s3StorageService.generatePublicUrl(submittedFile.getFilePath());
                
                Map<String, Object> fileData = new HashMap<>();
                fileData.put("fileId", submittedFile.getFileId());
                fileData.put("fileName", submittedFile.getFileName());
                fileData.put("fileType", submittedFile.getFileType());
                fileData.put("fileSize", submittedFile.getFileSize());
                fileData.put("downloadUrl", publicUrl);
                
                assignmentData.put("submittedFile", fileData);
            }
            
            // Add corrected file info with public S3 URL if available
            if (assignment.getCorrectedFile() != null) {
                MediaFile correctedFile = assignment.getCorrectedFile();
                // Ensure file is publicly accessible
                s3StorageService.makeFilePublic(correctedFile.getFilePath());
                // Generate public URL
                String publicUrl = s3StorageService.generatePublicUrl(correctedFile.getFilePath());
                
                Map<String, Object> fileData = new HashMap<>();
                fileData.put("fileId", correctedFile.getFileId());
                fileData.put("fileName", correctedFile.getFileName());
                fileData.put("fileType", correctedFile.getFileType());
                fileData.put("fileSize", correctedFile.getFileSize());
                fileData.put("downloadUrl", publicUrl);
                
                assignmentData.put("correctedFile", fileData);
            }
            
            response.add(assignmentData);
        }
        
        return ResponseEntity.ok(response);
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
    
    @GetMapping("/send-csv-report")
    public ResponseEntity<String> sendAssignmentsCSVByEmail(
            @RequestParam("cohortId") String cohortId) throws IOException {
        try {
            // Call a new service method that generates and emails only the CSV
            userAssignmentService.generateAndEmailAssignmentsCSV(cohortId);
            return ResponseEntity.ok("Assignments CSV report has been sent successfully to the mentor's email.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send assignments CSV: " + e.getMessage());
        }
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
    @GetMapping("/{assignmentId}/submitted-file-details")
    public ResponseEntity<Map<String, Object>> getSubmittedFileDetails(@PathVariable String assignmentId) {
        return ResponseEntity.ok(userAssignmentService.getSubmittedFileDetails(assignmentId));
    }

    @GetMapping("/{assignmentId}/corrected-file-details")
    public ResponseEntity<Map<String, Object>> getCorrectedFileDetails(@PathVariable String assignmentId) {
        return ResponseEntity.ok(userAssignmentService.getCorrectedFileDetails(assignmentId));
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<UserAssignment> getAssignmentById(@PathVariable String assignmentId) {
        return ResponseEntity.ok(userAssignmentService.getAssignmentById(assignmentId));
    }
    
    @GetMapping("/user-assignment")
    public ResponseEntity<Map<String, Object>> getAssignmentByUserAndSubconcept(
            @RequestParam("userId") String userId,
            @RequestParam("subconceptId") String subconceptId) {
        
        UserAssignment assignment = userAssignmentService.getAssignmentByUserIdAndSubconceptId(userId, subconceptId);
        Map<String, Object> response = new HashMap<>();
        
        if (assignment == null) {
            response.put("status", "not_found");
            response.put("message", "No assignment found for this user and subconcept");
            return ResponseEntity.ok(response);
        }
        
        // Basic assignment details
        response.put("assignmentId", assignment.getAssignmentId());
        response.put("submittedDate", assignment.getSubmittedDate());
        
        // Add submitted file info if available
        if (assignment.getSubmittedFile() != null) {
        	MediaFile submittedFile = assignment.getSubmittedFile();   
            // Ensure file is publicly accessible
            s3StorageService.makeFilePublic(submittedFile.getFilePath()); 
            // Generate public S3 URL
            String publicUrl = s3StorageService.generatePublicUrl(submittedFile.getFilePath());
            Map<String, Object> submittedFileInfo = new HashMap<>();
            submittedFileInfo.put("fileId", assignment.getSubmittedFile().getFileId());
            submittedFileInfo.put("fileName", assignment.getSubmittedFile().getFileName());
            submittedFileInfo.put("fileType", assignment.getSubmittedFile().getFileType());
            submittedFileInfo.put("downloadUrl", publicUrl);
            response.put("submittedFile", submittedFileInfo);
        }
        
        // Check if assignment is corrected
        if (assignment.getCorrectedDate() != null) {
            response.put("status", "corrected");
            response.put("correctedDate", assignment.getCorrectedDate());
            response.put("score", assignment.getScore());
            response.put("remarks", assignment.getRemarks());
            
            // Add corrected file info if available
            if (assignment.getCorrectedFile() != null) {
            	 MediaFile correctedFile = assignment.getCorrectedFile();
                 
                 // Ensure file is publicly accessible
                 s3StorageService.makeFilePublic(correctedFile.getFilePath());
                 
                 // Generate public S3 URL
                 String publicUrl = s3StorageService.generatePublicUrl(correctedFile.getFilePath());
                Map<String, Object> correctedFileInfo = new HashMap<>();
                correctedFileInfo.put("fileId", assignment.getCorrectedFile().getFileId());
                correctedFileInfo.put("fileName", assignment.getCorrectedFile().getFileName());
                correctedFileInfo.put("fileType", assignment.getCorrectedFile().getFileType());
                correctedFileInfo.put("downloadUrl", publicUrl);
                response.put("correctedFile", correctedFileInfo);
            }
        } else {
            response.put("status", "not_corrected");
        }
        
        return ResponseEntity.ok(response);
    }
}
