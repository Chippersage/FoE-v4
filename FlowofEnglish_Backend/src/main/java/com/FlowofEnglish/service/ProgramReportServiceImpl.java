package com.FlowofEnglish.service;


import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.exception.ResourceNotFoundException;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import java.io.IOException;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;


@Service
public class ProgramReportServiceImpl implements ProgramReportService {
	
	@Autowired
	private UserRepository userRepository;

    @Autowired
    private ProgramRepository programRepository;
    
    @Autowired
    private CohortRepository cohortRepository;
    
    @Autowired
    private StageRepository stageRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private UserSubConceptRepository userSubConceptRepository;
    
    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;
    
    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;
    
    @Autowired
    private UserAttemptsRepository userAttemptsRepository;
    
    public UserDTO getUserInfo(String userId) {
	    User user = userRepository.findById(userId)
	        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	    
	    UserDTO userDTO = new UserDTO();
	    userDTO.setUserName(user.getUserName());
	    userDTO.setUserPhoneNumber(user.getUserPhoneNumber());
	    return userDTO;
	}

	private static final Logger log = LoggerFactory.getLogger(ProgramReportServiceImpl.class);

    
    @Override
    public ProgramReportDTO generateProgramReport(String userId, String programId) {
        log.info("Generating program report for user {} and program {}", userId, programId);
 
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));

        ProgramReportDTO report = new ProgramReportDTO();
        report.setProgramId(programId);
        report.setProgramName(program.getProgramName());
        report.setProgramDesc(program.getProgramDesc());

        // Get all stages for the program
        List<Stage> stages = stageRepository.findByProgram_ProgramId(programId);
        List<StageReportDTO> stageReports = new ArrayList<>();
        
        // Track overall statistics
        int totalUnits = 0;
        int completedUnits = 0;
        int totalSubconcepts = 0;
        int completedSubconcepts = 0;
        double totalScore = 0;
        int scoreCount = 0;
        
        // Get all user attempts for this program
        List<UserAttempts> allAttempts = userAttemptsRepository
            .findByUser_UserIdAndProgram_ProgramId(userId, programId);
            
        // Set first and last attempt dates
        if (!allAttempts.isEmpty()) {
            report.setFirstAttemptDate(allAttempts.stream()
                .min(Comparator.comparing(UserAttempts::getUserAttemptStartTimestamp))
                .map(UserAttempts::getUserAttemptStartTimestamp)
                .orElse(null));
                
            report.setLastAttemptDate(allAttempts.stream()
                .max(Comparator.comparing(UserAttempts::getUserAttemptEndTimestamp))
                .map(UserAttempts::getUserAttemptEndTimestamp)
                .orElse(null));
        }

        // Process each stage
        boolean previousStageCompleted = true;
        for (Stage stage : stages) {
            StageReportDTO stageReport = generateStageReport(userId, stage.getStageId());
            stageReport.setEnabled(previousStageCompleted);
            stageReports.add(stageReport);
            
            // Update statistics
            totalUnits += stageReport.getTotalUnits();
            completedUnits += stageReport.getCompletedUnits();
            
            // Update completion tracking
            previousStageCompleted = "yes".equals(stageReport.getCompletionStatus());
            
            // Process units within stage
            for (UnitReportDTO unitReport : stageReport.getUnits()) {
                totalSubconcepts += unitReport.getTotalSubconcepts();
                completedSubconcepts += unitReport.getCompletedSubconcepts();
                
                // Accumulate scores
                if (unitReport.getAverageScore() > 0) {
                    totalScore += unitReport.getAverageScore();
                    scoreCount++;
                }
            }
        }

        // Set overall statistics
        report.setTotalStages(stages.size());
        report.setCompletedStages((int) stageReports.stream()
            .filter(s -> "yes".equals(s.getCompletionStatus()))
            .count());
        report.setTotalUnits(totalUnits);
        report.setCompletedUnits(completedUnits);
        report.setTotalSubconcepts(totalSubconcepts);
        report.setCompletedSubconcepts(completedSubconcepts);
        
        // Calculate percentages
        report.setStageCompletionPercentage(calculatePercentage(report.getCompletedStages(), report.getTotalStages()));
        report.setUnitCompletionPercentage(calculatePercentage(completedUnits, totalUnits));
        report.setSubconceptCompletionPercentage(calculatePercentage(completedSubconcepts, totalSubconcepts));
        
        // Calculate average score
        report.setAverageScore(scoreCount > 0 ? totalScore / scoreCount : 0);
        
        // Generate score distribution
        report.setScoreDistribution(generateScoreDistribution(allAttempts));
        
        report.setStages(stageReports);
        
        return report;
    }

    @Override
    public StageReportDTO generateStageReport(String userId, String stageId) {
        Stage stage = stageRepository.findById(stageId)
            .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));
            
        StageReportDTO report = new StageReportDTO();
        report.setStageId(stageId);
        report.setStageName(stage.getStageName());
        report.setStageDesc(stage.getStageDesc());
        
        // Get all units for the stage
        List<Unit> units = unitRepository.findByStage_StageId(stageId);
        List<UnitReportDTO> unitReports = new ArrayList<>();
        
        // Process each unit
        boolean previousUnitCompleted = true;
        for (Unit unit : units) {
            UnitReportDTO unitReport = generateUnitReport(userId, unit.getUnitId());
            unitReport.setEnabled(previousUnitCompleted);
            unitReports.add(unitReport);
            
            previousUnitCompleted = "yes".equals(unitReport.getCompletionStatus());
        }
        
        // Calculate stage statistics
        report.setTotalUnits(units.size());
        report.setCompletedUnits((int) unitReports.stream()
            .filter(u -> "yes".equals(u.getCompletionStatus()))
            .count());
        report.setCompletionPercentage(calculatePercentage(report.getCompletedUnits(), report.getTotalUnits()));
        
        // Calculate average score for stage
        double totalScore = unitReports.stream()
            .mapToDouble(UnitReportDTO::getAverageScore)
            .filter(score -> score > 0)
            .average()
            .orElse(0.0);
        report.setAverageScore(totalScore);
        
        report.setUnits(unitReports);
        report.setCompletionStatus(report.getCompletedUnits() == report.getTotalUnits() ? "yes" : "no");
        
        return report;
    }

    @Override
    public UnitReportDTO generateUnitReport(String userId, String unitId) {
        Unit unit = unitRepository.findById(unitId)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
            
        UnitReportDTO report = new UnitReportDTO();
        report.setUnitId(unitId);
        report.setUnitName(unit.getUnitName());
        report.setUnitDesc(unit.getUnitDesc());
        
        // Get all subconcepts for the unit
        List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitId(unitId);
        List<SubconceptReportDTO> subconceptReports = new ArrayList<>();
        
        // Get all completed subconcepts for this user and unit
        List<UserSubConcept> completedSubconcepts = userSubConceptRepository
            .findByUser_UserIdAndUnit_UnitId(userId, unitId);
            
        // Process each subconcept
        for (ProgramConceptsMapping mapping : mappings) {
            SubconceptReportDTO subconceptReport = new SubconceptReportDTO();
            subconceptReport.setSubconceptId(mapping.getSubconcept().getSubconceptId());
            subconceptReport.setSubconceptDesc(mapping.getSubconcept().getSubconceptDesc());
            
            // Check completion status
            boolean isCompleted = completedSubconcepts.stream()
                .anyMatch(cs -> cs.getSubconcept().getSubconceptId()
                    .equals(mapping.getSubconcept().getSubconceptId()));
            subconceptReport.setCompleted(isCompleted);
            
            // Get attempts for this subconcept
            List<AttemptDTO> attempts = getUserAttempts(userId, mapping.getSubconcept().getSubconceptId());
            subconceptReport.setAttempts(attempts);
            
            // Calculate statistics
            if (!attempts.isEmpty()) {
                subconceptReport.setAttemptCount(attempts.size());
                subconceptReport.setHighestScore(attempts.stream()
                    .mapToInt(AttemptDTO::getScore)
                    .max()
                    .orElse(0));
                subconceptReport.setLastAttemptDate(attempts.get(attempts.size() - 1).getEndTimestamp());
            }
            
            subconceptReports.add(subconceptReport);
        }
        
        // Calculate unit statistics
        report.setTotalSubconcepts(mappings.size());
        report.setCompletedSubconcepts((int) subconceptReports.stream()
            .filter(SubconceptReportDTO::isCompleted)
            .count());
        report.setCompletionPercentage(calculatePercentage(report.getCompletedSubconcepts(), report.getTotalSubconcepts()));
        
        // Calculate average score for unit
        double totalScore = subconceptReports.stream()
            .mapToDouble(SubconceptReportDTO::getHighestScore)
            .filter(score -> score > 0)
            .average()
            .orElse(0.0);
        report.setAverageScore(totalScore);
        
        report.setSubconcepts(subconceptReports);
        report.setCompletionStatus(report.getCompletedSubconcepts() == report.getTotalSubconcepts() ? "yes" : "no");
        
        return report;
    }

    @Override
    public List<AttemptDTO> getUserAttempts(String userId, String subconceptId) {
        List<UserAttempts> attempts = userAttemptsRepository
            .findByUser_UserIdAndSubconcept_SubconceptId(userId, subconceptId);
            
        return attempts.stream()
            .map(this::mapToAttemptDTO)
            .sorted(Comparator.comparing(AttemptDTO::getStartTimestamp))
            .collect(Collectors.toList());
    }

    private AttemptDTO mapToAttemptDTO(UserAttempts attempt) {
        AttemptDTO dto = new AttemptDTO();
        dto.setAttemptId(attempt.getUserAttemptId());
        dto.setStartTimestamp(attempt.getUserAttemptStartTimestamp());
        dto.setEndTimestamp(attempt.getUserAttemptEndTimestamp());
        dto.setScore(attempt.getUserAttemptScore());
        dto.setSuccessful(attempt.isUserAttemptFlag());
        return dto;
    }

    private double calculatePercentage(int completed, int total) {
        return total == 0 ? 0 : (completed * 100.0) / total;
    }

    private Map<String, Integer> generateScoreDistribution(List<UserAttempts> attempts) {
        Map<String, Integer> distribution = new HashMap<>();
        distribution.put("0-20", 0);
        distribution.put("21-40", 0);
        distribution.put("41-60", 0);
        distribution.put("61-80", 0);
        distribution.put("81-100", 0);
        
        for (UserAttempts attempt : attempts) {
            int score = attempt.getUserAttemptScore();
            if (score <= 20) distribution.put("0-20", distribution.get("0-20") + 1);
            else if (score <= 40) distribution.put("21-40", distribution.get("21-40") + 1);
            else if (score <= 60) distribution.put("41-60", distribution.get("41-60") + 1);
            else if (score <= 80) distribution.put("61-80", distribution.get("61-80") + 1);
            else distribution.put("81-100", distribution.get("81-100") + 1);
        }
        
        return distribution;
    }
    
    @Override
    public byte[] generateCsvReport(String userId, String programId) {
        ProgramReportDTO report = generateProgramReport(userId, programId);
        
        // Assuming user information is retrieved based on userId
        UserDTO user = getUserInfo(userId);  // Add this method to fetch user details like name and phone number

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {

            // Header
            csvPrinter.printRecord("Learner Name", "Learner ID", "Learner PhoneNumber", "Program ID", 
                                    "Program Name", "Stage Name", "Unit Name", "Subconcept Name", 
                                   "Completion Status", "Average Score", "Attempt Count");

            // Data - Include user info for each record
            for (StageReportDTO stageReport : report.getStages()) {
                for (UnitReportDTO unitReport : stageReport.getUnits()) {
                    for (SubconceptReportDTO subconceptReport : unitReport.getSubconcepts()) {
                        csvPrinter.printRecord(
                                user.getUserName(),                
                                userId,                            
                                user.getUserPhoneNumber(),             
                                programId,                         
                                report.getProgramName(),          
                                stageReport.getStageName(),        
                                unitReport.getUnitName(),          
                                subconceptReport.getSubconceptDesc(),  
                                subconceptReport.isCompleted() ? "Completed" : "Incomplete",  
                                subconceptReport.getHighestScore(),  
                                subconceptReport.getAttemptCount()  
                        );
                    }
                }
            }

            csvPrinter.flush();
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error while generating CSV report", e);
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }



    @Override
    public byte[] generatePdfReport(String userId, String programId) {
        ProgramReportDTO report = generateProgramReport(userId, programId);
        
        // Assuming user information is retrieved based on userId
        UserDTO user = getUserInfo(userId);  // Add this method to fetch user details like name and phone number

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Add title
            document.add(new Paragraph("Program Report").setBold().setFontSize(18));

            // Program and user details
            document.add(new Paragraph("Username: " + user.getUserName()));
            document.add(new Paragraph("User ID: " + userId));
            document.add(new Paragraph("User Phone Number: " + user.getUserPhoneNumber()));
            document.add(new Paragraph("Program ID: " + programId));
            document.add(new Paragraph("Program Name: " + report.getProgramName()));
            document.add(new Paragraph("Total Stages: " + report.getTotalStages()));
            document.add(new Paragraph("Completed Stages: " + report.getCompletedStages()));
            document.add(new Paragraph("Average Score: " + report.getAverageScore()));

            // Add stages, units, and subconcepts
            for (StageReportDTO stageReport : report.getStages()) {
                document.add(new Paragraph("Stage: " + stageReport.getStageName()).setBold());

                for (UnitReportDTO unitReport : stageReport.getUnits()) {
                    document.add(new Paragraph("  Unit: " + unitReport.getUnitName()));

                    for (SubconceptReportDTO subconceptReport : unitReport.getSubconcepts()) {
                        document.add(new Paragraph("    Subconcept: " + subconceptReport.getSubconceptDesc()
                                + " (Status: " + (subconceptReport.isCompleted() ? "Completed" : "Incomplete") + ")"));
                    }
                }
            }

            document.close();
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error while generating PDF report", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    @Override
    public CohortProgressDTO getCohortProgress(String programId, String cohortId) {
        // Fetch the program
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        
        // Fetch the cohort
        Cohort cohort = cohortRepository.findById(cohortId)
            .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));
        
        // Fetch all users in the cohort
        List<UserCohortMapping> userMappings = userCohortMappingRepository.findByCohortCohortId(cohortId);
        List<User> users = userMappings.stream()
            .map(UserCohortMapping::getUser)
            .collect(Collectors.toList());
        
        // Prepare progress data for each user
        List<UserProgressDTO> userProgressList = new ArrayList<>();
        for (User user : users) {
            UserProgressDTO userProgress = new UserProgressDTO();
            userProgress.setUserId(user.getUserId());
            userProgress.setUserName(user.getUserName());
            
            // Fetch stages for the program
            List<Stage> stages = stageRepository.findByProgram_ProgramId(programId);
            int totalStages = stages.size();
            int completedStages = 0;
            int totalUnits = 0;
            int completedUnits = 0;
            int totalSubconcepts = 0;
            int completedSubconcepts = 0;
            
            // Process each stage
            boolean previousStageCompleted = true;
            for (Stage stage : stages) {
                List<Unit> units = unitRepository.findByStage_StageId(stage.getStageId());
                totalUnits += units.size();
                
                // Process units within stage
                boolean stageCompleted = true;
                boolean previousUnitCompleted = true;
                
                for (Unit unit : units) {
                    // Get all subconcepts for the unit
                    List<ProgramConceptsMapping> subconcepts = 
                        programConceptsMappingRepository.findByUnit_UnitId(unit.getUnitId());
                    totalSubconcepts += subconcepts.size();
                    
                    // Get completed subconcepts for this user and unit
                    List<UserSubConcept> completedSubconceptsList = userSubConceptRepository
                        .findByUser_UserIdAndUnit_UnitId(user.getUserId(), unit.getUnitId());
                    completedSubconcepts += completedSubconceptsList.size();
                    
                    // Check if unit is completed (all subconcepts completed)
                    boolean unitCompleted = previousUnitCompleted && 
                        completedSubconceptsList.size() == subconcepts.size();
                    
                    if (unitCompleted) {
                        completedUnits++;
                    }
                    
                    // Update completion tracking for next unit
                    previousUnitCompleted = unitCompleted;
                    if (!unitCompleted) {
                        stageCompleted = false;
                    }
                }
                
                // Check if stage is completed (all units completed and previous stage completed)
                if (stageCompleted && previousStageCompleted) {
                    completedStages++;
                }
                
                // Update completion tracking for next stage
                previousStageCompleted = stageCompleted;
            }
            
            // Populate progress statistics
            userProgress.setTotalStages(totalStages);
            userProgress.setCompletedStages(completedStages);
            userProgress.setTotalUnits(totalUnits);
            userProgress.setCompletedUnits(completedUnits);
            userProgress.setTotalSubconcepts(totalSubconcepts);
            userProgress.setCompletedSubconcepts(completedSubconcepts);
            
            // Fetch leaderboard score
            UserCohortMapping mapping = userMappings.stream()
                .filter(um -> um.getUser().getUserId().equals(user.getUserId()))
                .findFirst()
                .orElse(null);
            userProgress.setLeaderboardScore(mapping != null ? mapping.getLeaderboardScore() : 0);
            
            userProgressList.add(userProgress);
        }
        
        // Prepare response DTO
        CohortProgressDTO cohortProgress = new CohortProgressDTO();
        cohortProgress.setProgramName(program.getProgramName());
        cohortProgress.setCohortName(cohort.getCohortName());
        cohortProgress.setUsers(userProgressList);
        
        return cohortProgress;
    }



}