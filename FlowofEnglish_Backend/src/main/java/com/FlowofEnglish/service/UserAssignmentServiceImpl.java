package com.FlowofEnglish.service;

import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
    private ProgramRepository programRepository;
    
    @Autowired
    private StageRepository stageRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private SubconceptRepository subconceptRepository;

    @Autowired
    private S3StorageService s3StorageService;
    
    @Autowired
    private S3Client s3Client;
    
    private static final String BUCKET_NAME = "your-s3-bucket-name";


    private static final String UPLOAD_DIR = "uploads/";
    private static final long MAX_PDF_SIZE = 1 * 1024 * 1024; // 1MB
    private static final long MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
    private static final long MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB


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
            throw new RuntimeException("Assignment for this subconcept in the same unit has already been submitted by the user.");
        }

        // Validate file size
        validateFileSize(file);

     // Upload to S3 and save metadata
        String s3Key = s3StorageService.uploadFile(file, "assignments");
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
            MediaFile file = assignmentOpt.get().getSubmittedFile();
            return file;
        } else {
            throw new RuntimeException("Assignment not found");
        }
    }
    
    @Override
    public UserAssignment submitCorrectedAssignment(String assignmentId, Integer score, 
                                                  MultipartFile correctedFile) throws IOException {
        UserAssignment assignment = userAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        validateFileSize(correctedFile);

        String filePath = saveFileToSystem(correctedFile);
        MediaFile mediaFile = saveFileMetadata(correctedFile, filePath, assignment.getUser());

        assignment.setCorrectedFile(mediaFile);
        assignment.setCorrectedDate(OffsetDateTime.now(ZoneOffset.UTC));
        assignment.setScore(score);

        return userAssignmentRepository.save(assignment);
    }
    
 // Helper method to validate file size based on type
    private void validateFileSize(MultipartFile file) {
        long fileSize = file.getSize();
        String fileType = file.getContentType();

        if (fileType.contains("pdf") && fileSize > MAX_PDF_SIZE) {
            throw new RuntimeException("PDF file size exceeds the limit of 1MB");
        }
        if (fileType.contains("video") && fileSize > MAX_VIDEO_SIZE) {
            throw new RuntimeException("Video file size exceeds the limit of 30MB");
        }
        if (fileType.contains("audio") && fileSize > MAX_AUDIO_SIZE) {
            throw new RuntimeException("Audio file size exceeds the limit of 10MB");
        }
        if (fileType.contains("image") && fileSize > MAX_IMAGE_SIZE) {
            throw new RuntimeException("Image file size exceeds the limit of 1MB");
        }
    }

    private String saveFileToSystem(MultipartFile file) throws IOException {
        String directory = UPLOAD_DIR + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "/";
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path path = Paths.get(directory + filename);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        return path.toString();
    }

    private MediaFile saveFileMetadata(MultipartFile file, String s3Key, User user) {
        MediaFile mediaFile = new MediaFile();
        mediaFile.setFileName(file.getOriginalFilename());
        mediaFile.setFileType(file.getContentType());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setFilePath(s3Key);  // Store S3 key instead of local path
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
                
                // Download from S3 and add to zip
                try (ResponseInputStream<GetObjectResponse> s3Object = 
                        s3StorageService.downloadFile(file.getFilePath())) {
                    zipOut.putNextEntry(new ZipEntry(file.getFileName()));
                    s3Object.transferTo(zipOut);
                    zipOut.closeEntry();
                }
            }
        }
        
        return new FileSystemResource(tempZipPath);
    }
    
    private String uploadFileToS3(MultipartFile file) throws IOException {
        String fileKey = LocalDate.now() + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(fileKey)
                .build(),
            Paths.get(file.getOriginalFilename()) // Save the file locally temporarily
        );
        return fileKey; // Return the S3 key for the file
    }
    
    @Override
    public void uploadCorrectedAssignments(List<MultipartFile> files, List<Integer> scores, 
                                           List<String> assignmentIds) throws IOException {
        for (int i = 0; i < files.size(); i++) {
            String assignmentId = assignmentIds.get(i);
            MultipartFile correctedFile = files.get(i);
            Integer score = scores.get(i);

            UserAssignment assignment = userAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found for ID: " + assignmentId));

            validateFileSize(correctedFile);

            String filePath = saveFileToSystem(correctedFile);
            MediaFile mediaFile = saveFileMetadata(correctedFile, filePath, assignment.getUser());

            assignment.setCorrectedFile(mediaFile);
            assignment.setCorrectedDate(OffsetDateTime.now(ZoneOffset.UTC));
            assignment.setScore(score);

            userAssignmentRepository.save(assignment);
        }
    }

}
