package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import jakarta.transaction.Transactional;
import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.exception.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

//import software.amazon.awssdk.core.ResponseInputStream;
//import software.amazon.awssdk.services.s3.S3Client;
//import software.amazon.awssdk.services.s3.model.GetObjectResponse;
//import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.*;
//import java.net.URL;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class UserAssignmentServiceImpl implements UserAssignmentService {
    @Autowired
    private UserAssignmentRepository userAssignmentRepository;
    
    @Autowired
    private MediaFileRepository mediaFileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CohortRepository cohortRepository;
    
    @Autowired
    private CohortProgramRepository cohortProgramRepository;
    
    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private StageRepository stageRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private UserCohortMappingService userCohortMappingService;
    
    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    @Autowired
    private SubconceptRepository subconceptRepository;

    @Autowired
    private S3StorageService s3StorageService;
    
    @Autowired
    private UserAttemptsRepository userAttemptsRepository;
    
//    @Autowired
//    private S3Client s3Client;
  
    private static final String BUCKET_NAME = "foe-learner-files";

 //   private static final String UPLOAD_DIR = "/var/app/uploads/";
    private static final long MAX_PDF_SIZE = 1 * 1024 * 1024; // 1MB
    private static final long MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
    private static final long MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EmailService.class);

    @Override
    public List<UserAssignment> getAssignmentsByUserId(String userId) {
        return userAssignmentRepository.findByUserUserId(userId);
    }

    @Override
    public List<UserAssignment> getAssignmentsByCohortId(String cohortId) {
        return userAssignmentRepository.findByCohortCohortId(cohortId);
    }

    @Override
    public List<UserAssignment> getAssignmentsByCohortIdAndUserId(String cohortId, String userId) {
        return userAssignmentRepository.findByCohortCohortIdAndUserUserId(cohortId, userId);
    }
    @Override
    public Map<String, Object> getUserAssignmentsForCohort(String cohortId, String userId) {
        // This is a wrapper for backward compatibility
        return getAssignmentsByCohortIdAndUserId(cohortId, userId, null);
    }
    
    @Override
    public Map<String, Object> getAssignmentsByCohortIdAndUserId(String cohortId, String userId, String programId) {
        // Find user-cohort mapping to validate user belongs to cohort
        UserCohortMapping userCohortMapping = userCohortMappingRepository.findByUser_UserIdAndCohort_CohortId(userId, cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + userId + "' is not mapped to cohort '" + cohortId + "'"));
        
        // Validate: cohort is mapped to program
        cohortProgramRepository.findByProgram_ProgramIdAndCohort_CohortId(programId, cohortId).orElseThrow(() -> new ForbiddenException(
                        "Invalid mapping: Cohort '" + cohortId + "' is not assigned under program '" + "'"));
        
        // Get all assignments for the user in this cohort
        List<UserAssignment> assignments = userAssignmentRepository.findByCohortCohortIdAndUserUserId(cohortId, userId);
        
        // Get user details
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        // Get cohort details
        Cohort cohort = cohortRepository.findById(cohortId).orElseThrow(() -> new ResourceNotFoundException("Cohort not found: " + cohortId));
        
        // Get program details
        Program program = programRepository.findById(programId).orElseThrow(() -> new ResourceNotFoundException("Program not found: "));
        
        // Calculate statistics
        long submittedCount = assignments.size();
        long evaluatedCount = assignments.stream().filter(assignment -> assignment.getCorrectedDate() != null).count();
        long pendingReviewCount = submittedCount - evaluatedCount;
        
        // Create response map
        Map<String, Object> response = new LinkedHashMap<>();
        
        // Add user info
        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("userId", user.getUserId());
        userInfo.put("userName", user.getUserName());
        userInfo.put("userType", user.getUserType());
        userInfo.put("userEmail", user.getUserEmail());
        userInfo.put("userAddress", user.getUserAddress());
        userInfo.put("userPhoneNumber", user.getUserPhoneNumber());
        userInfo.put("status", user.getStatus());
        userInfo.put("leaderboardScore", userCohortMapping.getLeaderboardScore());
        userInfo.put("createdAt", user.getCreatedAt());
        response.put("user", userInfo);
        
        // Add cohort info
        Map<String, Object> cohortInfo = new LinkedHashMap<>();
        cohortInfo.put("cohortId", cohort.getCohortId());
        cohortInfo.put("cohortName", cohort.getCohortName());
        cohortInfo.put("cohortStartDate", cohort.getCohortStartDate());
        cohortInfo.put("cohortEndDate", cohort.getCohortEndDate());
        
        // Add program info to cohort
        Map<String, Object> programInfo = new LinkedHashMap<>();
        programInfo.put("programId", program.getProgramId());
        programInfo.put("programName", program.getProgramName());
        cohortInfo.put("program", programInfo);
        
        response.put("cohort", cohortInfo);
        
        // Add statistics
        response.put("submitted", submittedCount);
        response.put("evaluated", evaluatedCount);
        response.put("pendingReview", pendingReviewCount);
        
        // Process assignments
        List<Map<String, Object>> assignmentList = new ArrayList<>();
        
        for (UserAssignment assignment : assignments) {
            Map<String, Object> assignmentMap = new LinkedHashMap<>();
            
            // Basic assignment info
            assignmentMap.put("assignmentId", assignment.getAssignmentId());
            
            // Program info
            Map<String, Object> assignmentProgram = new LinkedHashMap<>();
            assignmentProgram.put("programId", assignment.getProgram().getProgramId());
            assignmentProgram.put("programName", assignment.getProgram().getProgramName());
            assignmentMap.put("program", assignmentProgram);
            
            // Stage info
            Map<String, Object> stageInfo = new LinkedHashMap<>();
            stageInfo.put("stageId", assignment.getStage().getStageId());
            stageInfo.put("stageName", assignment.getStage().getStageName());
            assignmentMap.put("stage", stageInfo);
            
            // Unit info
            Map<String, Object> unitInfo = new LinkedHashMap<>();
            unitInfo.put("unitId", assignment.getUnit().getUnitId());
            unitInfo.put("unitName", assignment.getUnit().getUnitName());
            assignmentMap.put("unit", unitInfo);
            
            // Subconcept info
            Map<String, Object> subconceptInfo = new LinkedHashMap<>();
            Subconcept subconcept = assignment.getSubconcept();
            subconceptInfo.put("subconceptId", subconcept.getSubconceptId());
            subconceptInfo.put("showTo", subconcept.getShowTo());
            subconceptInfo.put("subconceptDesc", subconcept.getSubconceptDesc());
            subconceptInfo.put("subconceptLink", subconcept.getSubconceptLink());
            subconceptInfo.put("subconceptType", subconcept.getSubconceptType());
            subconceptInfo.put("numQuestions", subconcept.getNumQuestions());
            subconceptInfo.put("subconceptMaxscore", subconcept.getSubconceptMaxscore());
         // Process dependency information
            String dependencyIds = subconcept.getDependency();
            if (dependencyIds != null && !dependencyIds.isEmpty()) {
                // Parse dependency IDs (assuming comma-separated list)
                String[] dependencyIdArray = dependencyIds.split(",");
                List<Map<String, Object>> dependencyList = new ArrayList<>();
                
                for (String dependencyId : dependencyIdArray) {
                    dependencyId = dependencyId.trim();
                    // Fetch the dependency subconcept
                    Optional<Subconcept> dependencySubconcept = subconceptRepository.findBySubconceptId(dependencyId);
                    
                    if (dependencySubconcept.isPresent()) {
                        Map<String, Object> dependencyData = new LinkedHashMap<>();
                        dependencyData.put("subconceptId", dependencySubconcept.get().getSubconceptId());
                        dependencyData.put("subconceptDesc", dependencySubconcept.get().getSubconceptDesc());
                        dependencyData.put("subconceptLink", dependencySubconcept.get().getSubconceptLink());
                        dependencyData.put("subconceptMaxscore", dependencySubconcept.get().getSubconceptMaxscore());
                        dependencyData.put("subconceptType", dependencySubconcept.get().getSubconceptType());
                        dependencyList.add(dependencyData);
                    }
                }
                
                subconceptInfo.put("dependencies", dependencyList);
            }
            assignmentMap.put("subconcept", subconceptInfo);
            
            // Submitted file info
            if (assignment.getSubmittedFile() != null) {
                MediaFile submittedFile = assignment.getSubmittedFile();
                Map<String, Object> submittedFileInfo = new LinkedHashMap<>();
                submittedFileInfo.put("fileId", submittedFile.getFileId());
                submittedFileInfo.put("fileName", submittedFile.getFileName());
                submittedFileInfo.put("fileType", submittedFile.getFileType());
                submittedFileInfo.put("fileSize", submittedFile.getFileSize());
                submittedFileInfo.put("uploadedAt", submittedFile.getUploadedAt());
                
                // Generate public URL for the file
                s3StorageService.makeFilePublic(submittedFile.getFilePath());
                String publicUrl = s3StorageService.generatePublicUrl(submittedFile.getFilePath());
                submittedFileInfo.put("downloadUrl", publicUrl);
                
                assignmentMap.put("submittedFile", submittedFileInfo);
            }
            
            // Corrected file info
            if (assignment.getCorrectedFile() != null) {
                MediaFile correctedFile = assignment.getCorrectedFile();
                Map<String, Object> correctedFileInfo = new LinkedHashMap<>();
                correctedFileInfo.put("fileId", correctedFile.getFileId());
                correctedFileInfo.put("fileName", correctedFile.getFileName());
                correctedFileInfo.put("fileType", correctedFile.getFileType());
                correctedFileInfo.put("fileSize", correctedFile.getFileSize());
                correctedFileInfo.put("uploadedAt", correctedFile.getUploadedAt());
                
                // Generate public URL for the file
                s3StorageService.makeFilePublic(correctedFile.getFilePath());
                String publicUrl = s3StorageService.generatePublicUrl(correctedFile.getFilePath());
                correctedFileInfo.put("downloadUrl", publicUrl);
                
                assignmentMap.put("correctedFile", correctedFileInfo);
            }
            
            // Assignment dates and scores
            assignmentMap.put("submittedDate", assignment.getSubmittedDate());
            assignmentMap.put("correctedDate", assignment.getCorrectedDate());
            assignmentMap.put("score", assignment.getScore());
            assignmentMap.put("remarks", assignment.getRemarks());
            
            assignmentList.add(assignmentMap);
        }
        
        response.put("assignments", assignmentList);
        
        return response;
    }

 // Method for creating the assignment entry after submitting a file
    @Override
    public UserAssignment submitNewAssignment(String userId, String cohortId, String programId, 
                                            String stageId, String unitId, String subconceptId, 
                                            MultipartFile file) throws IOException {
        // Validate all required entities exist
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Cohort cohort = cohortRepository.findById(cohortId)
            .orElseThrow(() -> new RuntimeException("Cohort not found"));
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Program not found"));
        Stage stage = stageRepository.findById(stageId)
            .orElseThrow(() -> new RuntimeException("Stage not found"));
        Unit unit = unitRepository.findById(unitId)
            .orElseThrow(() -> new RuntimeException("Unit not found"));
        Subconcept subconcept = subconceptRepository.findById(subconceptId)
            .orElseThrow(() -> new RuntimeException("Subconcept not found"));
        
     // Check if an assignment already exists for the user with the same program, stage, unit, and subconcept
        Optional<UserAssignment> existingAssignment = userAssignmentRepository.findByUserUserIdAndProgramProgramIdAndStageStageIdAndUnitUnitIdAndSubconceptSubconceptId(
            userId, programId, stageId, unitId, subconceptId
        );
        if (existingAssignment.isPresent()) {
            throw new RuntimeException("It looks like you have already submitted an assignment.");
        }

        // Validate file size
        validateFileSize(file);
        

     // Upload to S3 and save metadata
        String s3Key = s3StorageService.uploadFile(file, cohortId, userId, programId, stageId, unitId, subconceptId, "submitted");
        MediaFile mediaFile = saveFileMetadata(file, s3Key, user);
       
        // Create new assignment
        UserAssignment assignment = new UserAssignment();
        assignment.setUser(user);
        assignment.setCohort(cohort);
        assignment.setProgram(program);
        assignment.setStage(stage);
        assignment.setUnit(unit);
        assignment.setSubconcept(subconcept);
        assignment.setSubmittedFile(mediaFile);
        assignment.setSubmittedDate(OffsetDateTime.now(ZoneOffset.UTC));
        assignment.setUuid(UUID.randomUUID().toString());

        return userAssignmentRepository.save(assignment);
    }

 // Updated method to get file details including presigned URL
    public Map<String, Object> getSubmittedFileDetails(String assignmentId) {
        Optional<UserAssignment> assignmentOpt = userAssignmentRepository.findById(assignmentId);
        if (assignmentOpt.isPresent()) {
            MediaFile file = assignmentOpt.get().getSubmittedFile();
            // Ensure the file is publicly accessible
            s3StorageService.makeFilePublic(file.getFilePath());  
            // Get public URL without credentials
            String publicUrl = s3StorageService.generatePublicUrl(file.getFilePath());

            
            Map<String, Object> fileDetails = new HashMap<>();
            fileDetails.put("fileId", file.getFileId());
            fileDetails.put("fileName", file.getFileName());
            fileDetails.put("fileType", file.getFileType());
            fileDetails.put("fileSize", file.getFileSize());
            fileDetails.put("downloadUrl", publicUrl);
            
            return fileDetails;
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }

    // Updated method to get file details including presigned URL
    public Map<String, Object> getCorrectedFileDetails(String assignmentId) {
        Optional<UserAssignment> assignmentOpt = userAssignmentRepository.findById(assignmentId);
        if (assignmentOpt.isPresent()) {
            MediaFile file = assignmentOpt.get().getCorrectedFile();
            if (file == null) {
                throw new RuntimeException("Corrected file not found");
            }
            // Ensure the file is publicly accessible
            s3StorageService.makeFilePublic(file.getFilePath());
            // Get public URL without credentials
            String publicUrl = s3StorageService.generatePublicUrl(file.getFilePath());
            Map<String, Object> fileDetails = new HashMap<>();
            fileDetails.put("fileId", file.getFileId());
            fileDetails.put("fileName", file.getFileName());
            fileDetails.put("fileType", file.getFileType());
            fileDetails.put("fileSize", file.getFileSize());
            fileDetails.put("downloadUrl",  publicUrl);
            
            return fileDetails;
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }
            		
            		
    public MediaFile getSubmittedFile(String assignmentId) {
        Optional<UserAssignment> assignmentOpt = userAssignmentRepository.findById(assignmentId);
        if (assignmentOpt.isPresent()) {
            MediaFile file = assignmentOpt.get().getSubmittedFile();
            return file;
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }

    public MediaFile getCorrectedFile(String assignmentId) {
        Optional<UserAssignment> assignmentOpt = userAssignmentRepository.findById(assignmentId);
        if (assignmentOpt.isPresent()) {
            MediaFile file = assignmentOpt.get().getCorrectedFile();
            if (file == null) {
                throw new RuntimeException("Corrected file not found for assignment: " + assignmentId);
            }
            return file;
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }

    
    @Override
    @Transactional
    public UserAssignment submitCorrectedAssignment(String assignmentId, Integer score, MultipartFile correctedFile, 
                                                   String remarks, OffsetDateTime correctedDate) throws IOException {
        UserAssignment assignment = userAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        // Store the old score for leaderboard calculation
        Integer oldScore = assignment.getScore() != null ? assignment.getScore() : 0;
        
        // Check if score exceeds max score
        if (score != null && assignment.getSubconcept() != null) {
            Integer maxScore = assignment.getSubconcept().getSubconceptMaxscore();
            if (maxScore != null && score > maxScore) {
                throw new IllegalArgumentException("Score cannot exceed the maximum score of " + maxScore);
            }
        }

        // Validate corrected date is not earlier than submitted date
        if (correctedDate != null && assignment.getSubmittedDate() != null) {
            if (correctedDate.isBefore(assignment.getSubmittedDate())) {
                throw new IllegalArgumentException("Correction date cannot be earlier than submission date");
            }
        }

        if (correctedFile != null && !correctedFile.isEmpty()) {
            validateFileSize(correctedFile);
            // Upload corrected file to S3
            String s3Key = s3StorageService.uploadFile(
                correctedFile, 
                assignment.getCohort().getCohortId(), 
                assignment.getUser().getUserId(),
                assignment.getProgram().getProgramId(),
                assignment.getStage().getStageId(),
                assignment.getUnit().getUnitId(),
                assignment.getSubconcept().getSubconceptId(),
                "corrected"
            );
            
            MediaFile mediaFile = saveFileMetadata(correctedFile, s3Key, assignment.getUser());
            assignment.setCorrectedFile(mediaFile);
        }

        assignment.setCorrectedDate(correctedDate != null ? correctedDate : OffsetDateTime.now(ZoneOffset.UTC));
        assignment.setScore(score);
        assignment.setRemarks(remarks);  // Save remarks

        // Save the assignment
        UserAssignment savedAssignment = userAssignmentRepository.save(assignment);
        
        // Update the corresponding UserAttempts entry with the corrected score
        if (score != null) {
            updateUserAttemptsScore(assignment, score, oldScore);
            
            // Calculate the score difference for leaderboard update
            int scoreDifference = score - oldScore;
            if (scoreDifference != 0) {
                updateLeaderboardScore(assignment.getUser().getUserId(), 
                                     assignment.getCohort().getCohortId(), 
                                     scoreDifference);
            }
        }
        
        // Send notification email to the user
        try {
            emailService.sendAssignmentCorrectionEmail(assignmentId);
        } catch (Exception e) {
            logger.warn("Failed to send correction notification email: {}", e.getMessage());
            // Don't throw exception to prevent disrupting the main process
        }
        
        return savedAssignment;
    }
    
    
     // Update the corresponding UserAttempts entry with the corrected score
    private void updateUserAttemptsScore(UserAssignment assignment, Integer newScore, Integer oldScore) {
        try {
            // Find the UserAttempts entry that corresponds to this assignment
            List<UserAttempts> userAttempts = userAttemptsRepository
                .findByUser_UserIdAndProgram_ProgramIdAndStage_StageIdAndUnit_UnitIdAndSubconcept_SubconceptId(
                    assignment.getUser().getUserId(),
                    assignment.getProgram().getProgramId(),
                    assignment.getStage().getStageId(),
                    assignment.getUnit().getUnitId(),
                    assignment.getSubconcept().getSubconceptId()
                );
            
            if (!userAttempts.isEmpty()) {
                // Get the most recent attempt (in case there are multiple)
                UserAttempts latestAttempt = userAttempts.stream()
                    .max((a1, a2) -> a1.getUserAttemptEndTimestamp().compareTo(a2.getUserAttemptEndTimestamp()))
                    .orElse(userAttempts.get(0));
                
                // Update the score
                latestAttempt.setUserAttemptScore(newScore);
                userAttemptsRepository.save(latestAttempt);
                
                logger.info("Updated UserAttempts score from {} to {} for attemptId: {}, userId: {}, subconceptId: {}", 
                           oldScore, newScore, latestAttempt.getUserAttemptId(), 
                           assignment.getUser().getUserId(), assignment.getSubconcept().getSubconceptId());
            } else {
                logger.warn("No UserAttempts entry found for userId: {}, subconceptId: {} to update score", 
                           assignment.getUser().getUserId(), assignment.getSubconcept().getSubconceptId());
            }
        } catch (Exception e) {
            logger.error("Error updating UserAttempts score for userId: {}, subconceptId: {}, Error: {}", 
                        assignment.getUser().getUserId(), assignment.getSubconcept().getSubconceptId(), e.getMessage(), e);
            // Don't throw exception to prevent disrupting the main correction process
        }
    }
    
    private void updateLeaderboardScore(String userId, String cohortId, Integer scoreDifference) {
        // Find the UserCohortMapping entry
        UserCohortMapping mapping = userCohortMappingRepository.findByUser_UserIdAndCohort_CohortId(userId, cohortId)
            .orElseThrow(() -> new RuntimeException("User-Cohort mapping not found"));
        
        // Update the leaderboard score with the difference
        int currentScore = mapping.getLeaderboardScore();
        mapping.setLeaderboardScore(currentScore + scoreDifference);
        
        // Save the updated mapping
        userCohortMappingRepository.save(mapping);
        
        logger.info("Updated leaderboard score by {} for userId: {}, cohortId: {}, newTotal: {}", 
                   scoreDifference, userId, cohortId, mapping.getLeaderboardScore());
    }
    
    // Helper method to validate file size based on type
    private void validateFileSize(MultipartFile file) {
        long fileSize = file.getSize();
        String fileType = file.getContentType();

        if ("application/pdf".equals(fileType) && fileSize > MAX_PDF_SIZE) {
            throw new RuntimeException("PDF file size exceeds the limit of 1MB");
        }
        if (fileType != null && fileType.startsWith("video/") && fileSize > MAX_VIDEO_SIZE) {
            throw new RuntimeException("Video file size exceeds the limit of 30MB");
        }
        if (fileType != null && fileType.startsWith("audio/") && fileSize > MAX_AUDIO_SIZE) {
            throw new RuntimeException("Audio file size exceeds the limit of 10MB");
        }
        if (fileType != null && fileType.startsWith("image/") && fileSize > MAX_IMAGE_SIZE) {
            throw new RuntimeException("Image file size exceeds the limit of 1MB");
        }
    }

    private String saveFileToSystem(MultipartFile file) throws IOException {
        // Define the directory path where the files will be saved
        String directory = BUCKET_NAME + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "/";
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path path = Paths.get(directory + filename);
        // Ensure the directory exists
        Path parentPath = path.getParent();
        if (!Files.exists(parentPath)) {
            Files.createDirectories(parentPath); // This will create the directory if it does not exist
        }
        // Write the file data to the directory
        Files.write(path, file.getBytes());
        return path.toString(); // Return the file path for database storage
    }

    private MediaFile saveFileMetadata(MultipartFile file, String s3Key, User user) {
        MediaFile mediaFile = new MediaFile();
        mediaFile.setFileName(file.getOriginalFilename());
        mediaFile.setFileType(file.getContentType());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setFilePath(s3Key);
        mediaFile.setUuid(UUID.randomUUID().toString());
        mediaFile.setUser(user);
        
        return mediaFileRepository.save(mediaFile);
    }

    
    @Override
    public UserAssignment getAssignmentById(String assignmentId) {
        return userAssignmentRepository.findById(assignmentId).orElseThrow(() -> new RuntimeException("Assignment not found"));
    }
    
    @Override
    public Resource downloadAllAssignments(String cohortId) throws IOException {
        List<UserAssignment> assignments = userAssignmentRepository.findByCohortCohortId(cohortId);

        if (assignments.isEmpty()) {
            throw new RuntimeException("No assignments found for the cohort.");
        }

        // Create a temporary zip file
        Path tempZipPath = Files.createTempFile("assignments_" + cohortId, ".zip");
        try (ZipOutputStream zipOut = new ZipOutputStream(Files.newOutputStream(tempZipPath))) {
            for (UserAssignment assignment : assignments) {
                MediaFile file = assignment.getSubmittedFile();

                if (file != null) {
                    // Download the file from S3
                    try (InputStream fileStream = s3StorageService.downloadFile(file.getFilePath())) {
                        if (fileStream != null) {
                            zipOut.putNextEntry(new ZipEntry(assignment.getUser().getUserId() + "_" + file.getFileName()));
                            byte[] buffer = new byte[1024];
                            int length;
                            while ((length = fileStream.read(buffer)) > 0) {
                                zipOut.write(buffer, 0, length);
                            }
                            zipOut.closeEntry();
                        } else {
                            logger.warn("File not found in S3: {}", file.getFilePath());
                        }
                    }
                }
            }
        }

        return new FileSystemResource(tempZipPath);
    }
    
    public Resource generateAssignmentsCSV(String cohortId) throws IOException {
        List<UserAssignment> allAssignments = userAssignmentRepository.findByCohortCohortId(cohortId);
        
        // Filter out corrected assignments
        List<UserAssignment> uncorrectedAssignments = allAssignments.stream()
        		.filter(assignment -> assignment.getScore() == null && assignment.getCorrectedDate() == null)
                .collect(Collectors.toList());
        
        if (uncorrectedAssignments.isEmpty()) {
            throw new RuntimeException("No uncorrected assignments found for the cohort.");
        }
        Path tempDir = Files.createTempDirectory("csv_export");
        Path csvFile = tempDir.resolve("assignments-details.csv");
        
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(csvFile.toFile()))) {
            // Write CSV header
            writer.println("AssignmentId,UserName,UserId,SubconceptLink,SubmittedFileId,SubmittedDate," +
//                          "ProgramId,StageId,UnitId,"
                          "MaxScore,Score,Remarks,FileName,FileDownloadLink");
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            
            // Write data rows
            for (UserAssignment assignment : uncorrectedAssignments) {
                String submittedDate = assignment.getSubmittedDate() != null ? 
                    assignment.getSubmittedDate().format(formatter) : "";
                String fileName = assignment.getSubmittedFile() != null ? 
                    assignment.getSubmittedFile().getFileName() : "";
                Integer maxScore = assignment.getSubconcept() != null ? 
                    assignment.getSubconcept().getSubconceptMaxscore() : null;
                // Generate public URL for the submitted file if it exists
                String fileDownloadLink = "";
                if (assignment.getSubmittedFile() != null) {
                    MediaFile file = assignment.getSubmittedFile();
                    // Ensure the file is publicly accessible
                    s3StorageService.makeFilePublic(file.getFilePath());
                    // Get public URL without credentials
                    fileDownloadLink = s3StorageService.generatePublicUrl(file.getFilePath());
                }
                
                writer.println(String.join(",",
                    safeString(assignment.getAssignmentId()),
                    safeString(assignment.getUser().getUserName()),
                    safeString(assignment.getUser().getUserId()),
                    safeString(assignment.getSubconcept().getSubconceptLink()),
                    assignment.getSubmittedFile() != null ? safeString(assignment.getSubmittedFile().getFileId()) : "",
                    safeString(submittedDate),
                    maxScore != null ? maxScore.toString() : "",
                    assignment.getScore() != null ? assignment.getScore().toString() : "",
                    safeString(assignment.getRemarks()),
                    safeString(fileName),
                    safeString(fileDownloadLink)
                ));
            }
        }
        
        return new FileSystemResource(csvFile);
    }
    
    // Helper method to escape commas in CSV fields
    private String safeString(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Override
    public Resource downloadAllAssignmentsSendEmail(String cohortId) throws IOException {
        List<UserAssignment> assignments = userAssignmentRepository.findByCohortCohortId(cohortId);

        if (assignments.isEmpty()) {
            throw new RuntimeException("No assignments found for the cohort.");
        }
        
        // Get the cohort name
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);
        if (!cohortOpt.isPresent()) {
            throw new RuntimeException("Cohort not found.");
        }
        String cohortName = cohortOpt.get().getCohortName();

        // Get the mentor's email
        List<UserCohortMappingDTO> cohortMappings;
        try {
            cohortMappings = userCohortMappingService.getUserCohortMappingsCohortId(cohortId);
            logger.info("Fetched cohort mappings: {}", cohortMappings);
        } catch (Exception e) {
            logger.error("Error fetching cohort mappings: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch mentor information", e);
        }

        Optional<UserCohortMappingDTO> mentorMapping = cohortMappings.stream()
                .filter(mapping -> "mentor".equalsIgnoreCase(mapping.getUserType()))
                .findFirst();
                
        if (!mentorMapping.isPresent()) {
            logger.error("No mentor found for cohort {}", cohortId);
            throw new RuntimeException("Mentor not found in the cohort.");
        }
        
        String mentorEmail = mentorMapping.get().getUserEmail();
        String mentorName = mentorMapping.get().getUserName();
        
        // Create a temporary zip file
        Path tempZipPath = null;
        try {
            tempZipPath = Files.createTempFile("assignments_" + cohortId, ".zip");
            logger.info("Created temporary zip file: {}", tempZipPath);
            
            try (ZipOutputStream zipOut = new ZipOutputStream(Files.newOutputStream(tempZipPath))) {
                // Generate CSV file
                Resource csvResource = generateAssignmentsCSV(cohortId);
                Path csvPath = csvResource.getFile().toPath();

                // Add CSV to ZIP
                zipOut.putNextEntry(new ZipEntry("assignments-details.csv"));
                Files.copy(csvPath, zipOut);
                zipOut.closeEntry();

                // Add assignment files to ZIP
                for (UserAssignment assignment : assignments) {
                    MediaFile file = assignment.getSubmittedFile();

                    if (file != null) {
                        Path filePath = Paths.get(file.getFilePath());
                        if (Files.exists(filePath)) {
                        	zipOut.putNextEntry(new ZipEntry(assignment.getUser().getUserId() + "_" + file.getFileName()));
                            Files.copy(filePath, zipOut);
                            zipOut.closeEntry();
                        } else {
                            logger.warn("File not found: {}", filePath);
                        }
                    }
                }
            }

            // Create a copy of the zip file that will be returned to the client
            Path returnZipPath = Files.createTempFile("return_assignments_" + cohortId, ".zip");
            Files.copy(tempZipPath, returnZipPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Created return zip file copy: {}", returnZipPath);

            // Send ZIP file via email
            try {
                sendEmailWithAttachment(mentorEmail, mentorName, cohortName, tempZipPath);
                logger.info("Assignments ZIP sent successfully to {}", mentorEmail);
            } catch (Exception e) {
                logger.error("Failed to send email to {}: {}", mentorEmail, e.getMessage());
                throw new RuntimeException("Error sending email with attachments", e);
            }

            // Return the copy of the zip file to the client
            return new FileSystemResource(returnZipPath);
        } catch (IOException e) {
            logger.error("Error creating ZIP file for cohort {}: {}", cohortId, e.getMessage());
            throw e;
        }
    }

    // Update the sendEmailWithAttachment method to not delete the file
    private void sendEmailWithAttachment(String mentorEmail, String mentorName, String cohortName, Path filePath) {
        try {
            emailService.sendEmailWithAttachment(mentorEmail, mentorName, cohortName, filePath);
        } catch (Exception e) {
            logger.error("Error sending email with attachment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
        // Don't delete the file here as it's handled in the calling method
    }
    
    @Override
    public void generateAndEmailAssignmentsCSV(String cohortId) throws IOException {
        List<UserAssignment> allAssignments = userAssignmentRepository.findByCohortCohortId(cohortId);
        // Filter out corrected assignments
        List<UserAssignment> uncorrectedAssignments = allAssignments.stream()
        		.filter(assignment -> assignment.getScore() == null && assignment.getCorrectedDate() == null)
                .collect(Collectors.toList());
        
        if (uncorrectedAssignments.isEmpty()) {
            throw new RuntimeException("No uncorrected assignments found for the cohort.");
        }
        
        if (allAssignments.isEmpty()) {
            throw new RuntimeException("No assignments found for the cohort.");
        }
        
        // Get the cohort name
        Optional<Cohort> cohortOpt = cohortRepository.findById(cohortId);
        if (!cohortOpt.isPresent()) {
            throw new RuntimeException("Cohort not found.");
        }
        String cohortName = cohortOpt.get().getCohortName();

        // Get the mentor's email
        List<UserCohortMappingDTO> cohortMappings;
        try {
            cohortMappings = userCohortMappingService.getUserCohortMappingsCohortId(cohortId);
            logger.info("Fetched cohort mappings: {}", cohortMappings);
        } catch (Exception e) {
            logger.error("Error fetching cohort mappings: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch mentor information", e);
        }

        Optional<UserCohortMappingDTO> mentorMapping = cohortMappings.stream()
                .filter(mapping -> "mentor".equalsIgnoreCase(mapping.getUserType()))
                .findFirst();
                
        if (!mentorMapping.isPresent()) {
            logger.error("No mentor found for cohort {}", cohortId);
            throw new RuntimeException("Mentor not found in the cohort.");
        }
        
        String mentorEmail = mentorMapping.get().getUserEmail();
        String mentorName = mentorMapping.get().getUserName();
        
        // Generate CSV file with S3 links
        Path tempDir = Files.createTempDirectory("csv_export");
        Path csvFile = tempDir.resolve("assignments-details.csv");
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(csvFile.toFile()))) {
            // Write CSV header
            writer.println("AssignmentId,Username,UserId,Assignment question,SubmittedFileId,SubmittedDate," +
//                          "ProgramName,StageName,UnitName,"
                           "MaxScore,Score,Remarks,FileName,FileDownloadLink,CorrectionDate,CorrectedFileAttached");
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            
            // Write data rows
            for (UserAssignment assignment : uncorrectedAssignments) {
                String submittedDate = assignment.getSubmittedDate() != null ? 
                    assignment.getSubmittedDate().format(formatter) : "";
                String fileName = assignment.getSubmittedFile() != null ? 
                    assignment.getSubmittedFile().getFileName() : "";
                Integer maxScore = assignment.getSubconcept() != null ? 
                    assignment.getSubconcept().getSubconceptMaxscore() : null;
                
                // Generate public URL for the submitted file if it exists
                String fileDownloadLink = "";
                if (assignment.getSubmittedFile() != null) {
                    MediaFile file = assignment.getSubmittedFile();
                    // Ensure the file is publicly accessible
                    s3StorageService.makeFilePublic(file.getFilePath());
                    // Get public URL without credentials
                    fileDownloadLink = s3StorageService.generatePublicUrl(file.getFilePath());
                }
                
                writer.println(String.join(",",
                    safeString(assignment.getAssignmentId()),
                    safeString(assignment.getUser().getUserName()),
                    safeString(assignment.getUser().getUserId()),
                    safeString(assignment.getSubconcept().getSubconceptLink()),
                    assignment.getSubmittedFile() != null ? safeString(assignment.getSubmittedFile().getFileId()) : "",
                    safeString(submittedDate),
                    maxScore != null ? maxScore.toString() : "",
                    assignment.getScore() != null ? assignment.getScore().toString() : "",
                    safeString(assignment.getRemarks()),
                    safeString(fileName),
                    safeString(fileDownloadLink),
                    "", // Empty column for CorrectedFileAttached flag
                    ""  // Empty column for CorrectionDate
                ));
            }
        }
        
        // Send CSV file via email
        try {
            sendEmailWithCSVAttachment(mentorEmail, mentorName, cohortName, csvFile);
            logger.info("Assignments CSV sent successfully to {}", mentorEmail);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", mentorEmail, e.getMessage());
            throw new RuntimeException("Error sending email with CSV attachment", e);
        } finally {
            // Clean up temp file after sending
            try {
                Files.deleteIfExists(csvFile);
                Files.deleteIfExists(tempDir);
            } catch (IOException e) {
                logger.warn("Failed to delete temporary CSV file: {}", e.getMessage());
            }
        }
    }

    // Helper method to send only CSV file by email
    private void sendEmailWithCSVAttachment(String mentorEmail, String mentorName, String cohortName, Path csvFilePath) {
        try {
            emailService.sendEmailWithCSVAttachment(mentorEmail, mentorName, cohortName, csvFilePath);
        } catch (Exception e) {
            logger.error("Error sending email with CSV attachment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    @Override
    public void uploadCorrectedAssignments(List<MultipartFile> files, List<Integer> scores, List<String> remarks, List<String> assignmentIds) throws IOException {
        if (files.size() != scores.size() || scores.size() != remarks.size() || remarks.size() != assignmentIds.size()) {
            throw new IllegalArgumentException("Mismatched number of files, scores, remarks, and assignment IDs.");
        }

        for (int i = 0; i < files.size(); i++) {
            String assignmentId = assignmentIds.get(i);
            MultipartFile correctedFile = files.get(i);
            Integer score = scores.get(i);
            String remark = remarks.get(i);

            UserAssignment assignment = userAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found for ID: " + assignmentId));

            validateFileSize(correctedFile);

            String filePath = saveFileToSystem(correctedFile);
            MediaFile mediaFile = saveFileMetadata(correctedFile, filePath, assignment.getUser());

            assignment.setCorrectedFile(mediaFile);
            assignment.setCorrectedDate(OffsetDateTime.now(ZoneOffset.UTC));
            assignment.setScore(score);
            assignment.setRemarks(remark);

            userAssignmentRepository.save(assignment);
        }
    }

    @Override
    public UserAssignment getAssignmentByUserIdAndSubconceptId(String userId, String subconceptId) {
        Optional<UserAssignment> assignmentOptional = userAssignmentRepository
            .findByUserUserIdAndSubconceptSubconceptId(userId, subconceptId);
        
        // Return null if not found (to be handled in controller)
        return assignmentOptional.orElse(null);
    }
    
    @Override
    public UserAssignmentMinimalDTO toMinimalDTO(UserAssignment assignment) {

        UserAssignmentMinimalDTO dto = new UserAssignmentMinimalDTO();

        dto.setAssignmentId(assignment.getAssignmentId());
        
        dto.setUserId(assignment.getUser().getUserId());
        dto.setUserName(assignment.getUser().getUserName());

        dto.setCohortId(assignment.getCohort().getCohortId());
        dto.setCohortName(assignment.getCohort().getCohortName());

        dto.setProgramId(assignment.getProgram().getProgramId());
        dto.setProgramName(assignment.getProgram().getProgramName());

        dto.setStageId(assignment.getStage().getStageId());
        dto.setStageName(assignment.getStage().getStageName());

        dto.setUnitId(assignment.getUnit().getUnitId());
        dto.setUnitName(assignment.getUnit().getUnitName());

        dto.setSubconceptId(assignment.getSubconcept().getSubconceptId());
        dto.setSubconceptDesc(assignment.getSubconcept().getSubconceptDesc());
        dto.setSubconceptDesc2(assignment.getSubconcept().getSubconceptDesc2());
        dto.setSubconceptLink(assignment.getSubconcept().getSubconceptLink());
        dto.setSubconceptMaxscore(assignment.getSubconcept().getSubconceptMaxscore());

        if (assignment.getSubmittedFile() != null) {
            MediaFile file = assignment.getSubmittedFile();

            s3StorageService.makeFilePublic(file.getFilePath());
            String publicUrl = s3StorageService.generatePublicUrl(file.getFilePath());

            dto.setFileName(file.getFileName());
            dto.setFileSize(file.getFileSize());
            dto.setDownloadUrl(publicUrl);
        }

        dto.setSubmittedDate(assignment.getSubmittedDate());
        dto.setCorrectedDate(assignment.getCorrectedDate());
        dto.setScore(assignment.getScore());
        dto.setRemarks(assignment.getRemarks());

        return dto;
    }


}