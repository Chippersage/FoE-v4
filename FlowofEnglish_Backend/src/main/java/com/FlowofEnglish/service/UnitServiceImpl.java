package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.*;
import com.FlowofEnglish.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.FlowofEnglish.exception.ResourceNotFoundException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnitServiceImpl implements UnitService {

    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    UserRepository userRepository;

    @Autowired
    private StageRepository stageRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;
    
    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;
    
    @Autowired
    private UserCohortMappingRepository userCohortMappingRepository;

    private static final Logger logger = LoggerFactory.getLogger(ProgramService.class);

    @Override
    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }
    
    @Override
    public Optional<Unit> findByUnitId(String unitId) {
        return unitRepository.findByUnitId(unitId);
    }

    @Override
    public Map<String, Object> bulkUploadUnits(MultipartFile file) {
        List<String> errorMessages = new ArrayList<>();
        Set<String> csvUnitIds = new HashSet<>(); // To track unitIds within the CSV file
        int successCount = 0;
        int failCount = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true; // Flag to skip the header

            while ((line = br.readLine()) != null) {
                // Skip the first line if it's the header
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                String[] data = line.split(",");
                if (data.length < 5) {
                    errorMessages.add("Invalid row format: " + line);
                    failCount++;
                    continue;
                }

                String unitId = data[0];
                String unitName = data[1];
                String unitDesc = data[2];
                String programId = data[3];
                String stageId = data[4];

                // Check if the unitId is a duplicate within the CSV file
                if (csvUnitIds.contains(unitId)) {
                    errorMessages.add("Unit ID " + unitId + " is a duplicate in the CSV file.");
                    failCount++;
                    continue;
                }

                // Validate if unitId already exists in the database
                if (unitRepository.existsById(unitId)) {
                    errorMessages.add("Unit ID " + unitId + " already exists in the database.");
                    failCount++;
                    continue;
                }

                // Validate program and stage existence
                Optional<Program> program = programRepository.findById(programId);
                Optional<Stage> stage = stageRepository.findById(stageId);

                if (program.isEmpty()) {
                    errorMessages.add("Program ID " + programId + " not found for Unit ID " + unitId);
                    failCount++;
                    continue;
                }

                if (stage.isEmpty()) {
                    errorMessages.add("Stage ID " + stageId + " not found for Unit ID " + unitId);
                    failCount++;
                    continue;
                }

                // Create new Unit
                Unit newUnit = new Unit();
                newUnit.setUnitId(unitId);
                newUnit.setUnitName(unitName);
                newUnit.setUnitDesc(unitDesc);
                newUnit.setProgram(program.get());
                newUnit.setStage(stage.get());
                newUnit.setUuid(UUID.randomUUID().toString());

                // Save the new Unit
                unitRepository.save(newUnit);
                successCount++;

                // Add unitId to the CSV tracking set
                csvUnitIds.add(unitId);
            }
        } catch (Exception e) {
            errorMessages.add("Failed to process file: " + e.getMessage());
        }

        // Return response with success and error details
        Map<String, Object> response = new HashMap<>();
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        response.put("errors", errorMessages);

        return response;
    }

    
    @Override
    public Unit updateUnit(String unitId, Unit unit) {
        Optional<Unit> existingUnit = unitRepository.findById(unitId);
        if (existingUnit.isPresent()) {
            Unit updatedUnit = existingUnit.get();
            updatedUnit.setUnitName(unit.getUnitName());
            updatedUnit.setUnitDesc(unit.getUnitDesc());
            updatedUnit.setProgram(unit.getProgram());
            updatedUnit.setStage(unit.getStage());
            return unitRepository.save(updatedUnit);
        }
        throw new RuntimeException("Unit not found with id: " + unitId);
    }

    @Override
    public Unit getUnitById(String unitId) {
        return unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + unitId));
    }
    

    @Override
    public void deleteUnit(String unitId) {
        unitRepository.deleteById(unitId);
    }

    @Override
    public void deleteUnits(List<String> unitIds) {
        unitRepository.deleteAllById(unitIds);
    }

    @Override
    public List<UnitResponseDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private UnitResponseDTO mapToDTO(Unit unit) {
        UnitResponseDTO dto = new UnitResponseDTO();
        dto.setUnitId(unit.getUnitId());
        dto.setUnitName(unit.getUnitName());
        dto.setUnitDesc(unit.getUnitDesc());
        return dto;
    }
    
    @Override 
    public ProgramDTO getProgramWithStagesAndUnits(String userId, String programId) {
        // Fetch the program details
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        logger.info("Getting program details for userId: {} and programId: {}", userId, programId);
     // Fetch user details to determine visibility
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String userType = user.getUserType();
        
     // Fetch cohort mapping
        UserCohortMapping userCohortMapping = userCohortMappingRepository.findByUserUserIdAndProgramId(userId, programId)
            .orElseThrow(() -> new ResourceNotFoundException("Cohort not found for the user and program"));

     // Fetch cohort details from mapping
        Cohort cohort = userCohortMapping.getCohort();
        // Retrieve delayed stage unlock settings
        boolean delayedStageUnlock = cohort.isDelayedStageUnlock();
        int delayInDays = cohort.getDelayInDays();
        OffsetDateTime currentDate = OffsetDateTime.now();
        logger.info("Cohort settings - delayedStageUnlock: {}, delayInDays: {}", delayedStageUnlock, delayInDays);

        ProgramDTO programResponse = new ProgramDTO();
        programResponse.setProgramId(program.getProgramId());
        programResponse.setProgramName(program.getProgramName());
        programResponse.setProgramDesc(program.getProgramDesc());

        // Fetch stages for the program
        List<Stage> stages = stageRepository.findByProgram_ProgramId(programId);
        Map<String, StageDTO> stageMap = new HashMap<>();
        int totalUnitCount = 0;
        int stagesCount = 0;

        // Fetch all UserSubConcepts for the user and unit to track completion
        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
        logger.info("Fetched UserSubConcepts: {}", userSubConcepts);
        System.out.println("Fetched UserSubConcepts: " + userSubConcepts);

      //  System.out.println("Fetched UserSubConcepts: {}", userSubConcepts);

        boolean previousStageCompleted = true;  
        boolean programCompleted = true;
     // Track the earliest completion date of the previous stage
        OffsetDateTime previousStageCompletionDate = null;
        
        // Iterate through stages and build the stage map
        for (int i = 0; i < stages.size(); i++) {
            Stage stage = stages.get(i);
            StageDTO stageResponse = new StageDTO();
            stageResponse.setStageId(stage.getStageId());
            stageResponse.setStageName(stage.getStageName());
            stageResponse.setStageDesc(stage.getStageDesc());
            System.out.println("Processing Stage: " + stage.getStageId());
            logger.info("Processing stage {} with name: {}", stage.getStageId(), stage.getStageName());

            // Fetch units for each stage
            List<Unit> units = unitRepository.findByStage_StageId(stage.getStageId());
            Map<String, UnitResponseDTO> unitMap = new HashMap<>();
            logger.info("Fetched units for stage {}: {}", stage.getStageId(), units);

            boolean stageCompleted = true;
            boolean stageCompletedWithoutAssignments = false;  
            // Get all completion dates for the current stage
            List<UserSubConcept> stageSubConcepts = userSubConcepts.stream()
                .filter(usc -> usc.getStage().getStageId().equals(stage.getStageId()))
                .collect(Collectors.toList());
         // Fetch the latest completion date for the current stage
            Optional<OffsetDateTime> latestStageCompletion = userSubConceptRepository
                .findLatestCompletionDateByUserIdAndStageId(userId, stage.getStageId());

            OffsetDateTime currentStageCompletionDate = latestStageCompletion.orElse(null);
            
            if (currentStageCompletionDate != null) {
                logger.info("Stage {} latest completion date: {}", stage.getStageId(), currentStageCompletionDate);
            } else {
                logger.warn("No completion date found for stage {}", stage.getStageId());
            }

            if (units.isEmpty()) {
                stageResponse.setStageCompletionStatus("There are no units and subconcepts in this stage");
                programCompleted = false;
            } else {
            	boolean allUnitsAtLeastPartiallyCompleted = true; // Track if all units are at least completed without assignments
            	
                for (int j = 0; j < units.size(); j++) {
                    Unit unit = units.get(j);
                    UnitResponseDTO unitResponse = new UnitResponseDTO();
                    unitResponse.setUnitId(unit.getUnitId());
                    unitResponse.setUnitName(unit.getUnitName());
                    unitResponse.setUnitDesc(unit.getUnitDesc());

                    // Fetch user sub concepts for the current unit
                    List<UserSubConcept> userSubConceptsForUnit = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unit.getUnitId());
                    // Update completion date tracking
                    if (!userSubConceptsForUnit.isEmpty()) {
                        OffsetDateTime latestCompletion = userSubConceptsForUnit.stream()
                            .map(UserSubConcept::getCompletionDate)
                            .filter(Objects::nonNull)
                            .max(OffsetDateTime::compareTo)
                            .orElse(null);
                        
                        if (latestCompletion != null) {
                            if (currentStageCompletionDate == null || 
                                latestCompletion.isAfter(currentStageCompletionDate)) {
                                currentStageCompletionDate = latestCompletion;
                            }
                        }
                    }
                 // Determine accessible mappings
                    List<ProgramConceptsMapping> mappings = programConceptsMappingRepository.findByUnit_UnitId(unit.getUnitId());
                    List<ProgramConceptsMapping> accessibleMappings = mappings.stream()
                        .filter(mapping -> isSubconceptVisibleToUser(userType, mapping.getSubconcept()))
                        .collect(Collectors.toList());
                          
                 // Get total number of sub-concepts (including assignments)
                    int totalSubConceptCount = accessibleMappings.size();
                    
                    // Calculate counts for non-assignment sub-concepts
                    int totalNonAssignmentSubConceptCount = (int) accessibleMappings.stream()
                        .map(ProgramConceptsMapping::getSubconcept)
                        .filter(sub -> !sub.getSubconceptType().toLowerCase().startsWith("assignment"))
                        .count();
                    
                    // Calculate counts for assignment sub-concepts
                    int totalAssignmentSubConceptCount = (int) accessibleMappings.stream()
                        .map(ProgramConceptsMapping::getSubconcept)
                        .filter(sub -> sub.getSubconceptType().toLowerCase().startsWith("assignment"))
                        .count();

                    long completedNonAssignmentSubConceptCount = accessibleMappings.stream()
                        .map(ProgramConceptsMapping::getSubconcept)
                        .filter(sub -> !sub.getSubconceptType().toLowerCase().startsWith("assignment"))
                        .map(Subconcept::getSubconceptId)
                        .filter(id -> userSubConceptsForUnit.stream()
                            .anyMatch(us -> us.getSubconcept().getSubconceptId().equals(id)))
                        .count();
                    
                 // Check for pending assignments
                    boolean hasPendingAssignments = accessibleMappings.stream()
                    	    .filter(mapping -> mapping.getSubconcept().getSubconceptType().toLowerCase().startsWith("assignment"))
                    	    .map(ProgramConceptsMapping::getSubconcept)
                    	    .map(Subconcept::getSubconceptId)
                    	    .anyMatch(id -> !userSubConceptsForUnit.stream()
                    	        .anyMatch(us -> us.getSubconcept().getSubconceptId().equals(id)));

                    String unitCompletionStatus;
                    if (totalSubConceptCount == 0) {
                        // Only mark as "No subconcepts" if there are truly no subconcepts of any type
                        unitCompletionStatus = "No subconcepts in this unit";
                    } else if (totalNonAssignmentSubConceptCount == 0 && totalAssignmentSubConceptCount > 0) {
                        // Unit has only assignments
                        if (hasPendingAssignments) {
                            unitCompletionStatus = "incomplete";
                        } else {
                            unitCompletionStatus = "yes";
                        }
                    } else if (completedNonAssignmentSubConceptCount == totalNonAssignmentSubConceptCount) {
                        if (hasPendingAssignments) {
                            unitCompletionStatus = "Unit Completed without Assignments";
                            stageCompletedWithoutAssignments = true;
                        } else {
                            unitCompletionStatus = "yes";
                        }
                    } else {
                        // Check the previous unit's completion status for enabling/disabling logic
                    	if (j == 0) {
                    	    // First unit logic (first unit in the stage)
                    	    unitCompletionStatus = "incomplete"; 
                    	}
                           else  {                        	   
                               UnitResponseDTO previousUnitResp = unitMap.get(String.valueOf(j - 1));
                               String previousUnitStatus = previousUnitResp != null ? previousUnitResp.getCompletionStatus() : "disabled";

                               if ("yes".equals(previousUnitStatus) || 
                                       "Unit Completed without Assignments".equals(previousUnitStatus)) {
                                       unitCompletionStatus = "incomplete";
                                   } else {
                                       unitCompletionStatus = "disabled";
                                   }
                               }
                           }

                // Set the unit status and add it to the unit map
                unitResponse.setCompletionStatus(unitCompletionStatus);
                unitMap.put(String.valueOf(j), unitResponse);
                totalUnitCount++;
                }

                // Check if all units are completed (either fully or without assignments)
                boolean allUnitsCompleted = unitMap.values().stream()
                    .allMatch(unitResp -> "yes".equals(unitResp.getCompletionStatus()) || 
                                        "Unit Completed without Assignments".equals(unitResp.getCompletionStatus()));
                
                stageResponse.setUnits(unitMap);
                // Adjust stage completion based on units
                if (stageCompletedWithoutAssignments) {
                    stageResponse.setStageCompletionStatus("Stage Completed without Assignments");
                 // Consider this as incomplete for overall program completion
                    programCompleted = false;
                } else {
                	String stageStatus = allUnitsCompleted ? "yes" : "no";
                stageResponse.setStageCompletionStatus(stageStatus);
                // Update program completion status
                if (!"yes".equals(stageStatus)) {
                    programCompleted = false;
                }
            }
        }
            
            if (i == 0) {
                // First stage is always enabled
                stageResponse.setStageEnabled(true);
            } else {
                // Apply delay unlock for subsequent stages
            	if (delayedStageUnlock) {
            		logger.info("Delayed stage unlock is enabled for stage {}", stage.getStageId());
                    logger.info("Previous stage completion date: {}", previousStageCompletionDate);
                    
            		System.out.println("Delayed stage unlock is enabled");
            		if (previousStageCompletionDate != null)
            		{
            	        if (delayInDays == 0) {
            	        	System.out.println("No delay configured (0 days) - enabling stage immediately");
            	            logger.info("Stage {} enabled immediately due to 0 delay days", stage.getStageId());
            	            
            	            // If delay is 0, enable immediately if previous stage is complete
            	            stageResponse.setStageEnabled(true);
            	            stageResponse.setDaysUntilNextStageEnabled(0);
            	        } else {
            	            OffsetDateTime unlockDate = previousStageCompletionDate.plusDays(delayInDays);
            	            long daysRemaining = ChronoUnit.DAYS.between(currentDate, unlockDate);
            	            long hoursRemaining = ChronoUnit.HOURS.between(currentDate, unlockDate);
            	           
            	            System.out.println("Current date: " + currentDate);
            	            System.out.println("Unlock date: " + unlockDate);
            	            System.out.println("Days remaining: " + daysRemaining);
            	            System.out.println("Hours remaining: " + hoursRemaining);
            	            logger.info("Stage {} delay calculation - Current date: {}, Unlock date: {}", 
            	            		stage.getStageId(), currentDate, unlockDate);
            	            logger.info("Time remaining for stage {} - Days: {}, Hours: {}", 
            	                stage.getStageId(), daysRemaining, hoursRemaining);

            	            if (currentDate.isBefore(unlockDate)) {
            	                stageResponse.setStageEnabled(false);
            	                stageResponse.setDaysUntilNextStageEnabled((int) daysRemaining);
            	                System.out.println("Stage is locked - " + daysRemaining + " days remaining");
            	                logger.info("Stage {} is locked with {} days and {} hours remaining", 
            	                    stage.getStageId(), daysRemaining, hoursRemaining);
            	                stageResponse.setDaysUntilNextStageEnabled((int) daysRemaining);
            	            } else {
            	                stageResponse.setStageEnabled(true);
            	                stageResponse.setDaysUntilNextStageEnabled(0);
            	                System.out.println("Stage is unlocked - delay period has passed");
            	                logger.info("Stage {} is unlocked - delay period has passed", stage.getStageId());
            	            }
            	        }
            	    } else {
            	    	logger.warn("No completion date found for previous stage {}", stages.get(i-1).getStageId());
                        StageDTO previousStage = stageMap.get(String.valueOf(i - 1));
                        String previousStageStatus = previousStage.getStageCompletionStatus();
                        boolean isPreviousStageCompleted = "yes".equals(previousStageStatus) || 
                                                       "Stage Completed without Assignments".equals(previousStageStatus);
                        
            	    	System.out.println("No completion date found for previous stage");
            	        // Handle legacy data with no completion dates
            	        if (delayInDays == 0) {
            	            System.out.println("Previous stage status: " + previousStageStatus);
            	            System.out.println("Previous stage completed: " + isPreviousStageCompleted);
            	            
            	            logger.info("Stage {} - Previous stage status: {}, completed: {}", 
            	                stage.getStageId(), previousStageStatus, isPreviousStageCompleted);

            	            stageResponse.setStageEnabled(isPreviousStageCompleted);
            	        } else {
            	            stageResponse.setStageEnabled(false);
            	            stageResponse.setDaysUntilNextStageEnabled(delayInDays);
            	            System.out.println("Stage locked - no completion date, using default delay: " + delayInDays);
            	            logger.warn("Stage {} locked - no completion date found, using default delay: {}", 
            	                stage.getStageId(), delayInDays);
            	        }
            	    }
            	} else {
            	    // Non-delayed stage logic
            	    StageDTO previousStage = stageMap.get(String.valueOf(i - 1));
            	    String previousStageStatus = previousStage.getStageCompletionStatus();
            	    boolean isPreviousStageCompleted = "yes".equals(previousStageStatus) || 
            	                                     "Stage Completed without Assignments".equals(previousStageStatus);
            	    System.out.println("Non-delayed stage unlock logic");
            	    System.out.println("Previous stage status: " + previousStageStatus);
            	    System.out.println("Previous stage completed: " + isPreviousStageCompleted);
            	    
            	    logger.info("Stage {} non-delayed unlock - Previous stage status: {}, completed: {}", 
            	        stage.getStageId(), previousStageStatus, isPreviousStageCompleted);
            	    stageResponse.setStageEnabled(isPreviousStageCompleted && !units.isEmpty());
            	}
            	// Update previous stage completion date for next iteration
                previousStageCompletionDate = currentStageCompletionDate;
                
            	// After setting stage status
            	logger.info("Stage {} final status - Enabled: {}, Days until next stage: {}", 
            	    stage.getStageId(), 
            	    stageResponse.isStageEnabled(), 
            	    stageResponse.getDaysUntilNextStageEnabled());
           }
            
         // Update previousStageCompleted for the next iteration
            previousStageCompleted = "yes".equals(stageResponse.getStageCompletionStatus());

            // Add the stage to the response
            stageMap.put(String.valueOf(i), stageResponse);
            stagesCount++;
        }

        // Set stagesCount and unitCount in the program response
        programResponse.setStages(stageMap);
        programResponse.setStagesCount(stagesCount);
        programResponse.setUnitCount(totalUnitCount);
        programResponse.setProgramCompletionStatus(programCompleted ? "yes" : "no");

        return programResponse;
    }
    /**
     * Helper method to determine if a sub-concept is visible to the user based on user type.
     */
    private boolean isSubconceptVisibleToUser(String userType, Subconcept subconcept) {
        // Assuming 'showTo' can have multiple values separated by commas, e.g., "student,teacher"
        Set<String> visibilitySet = Arrays.stream(subconcept.getShowTo().split(","))
                                         .map(String::trim)
                                         .map(String::toLowerCase)
                                         .collect(Collectors.toSet());
        return visibilitySet.contains(userType.toLowerCase());
    }

    /**
     * Helper method to get the total sub concept count for a unit.
     * (No changes needed here since counting is handled differently now)
     */
    private int getTotalSubConceptCount(String unitId) {
        List<ProgramConceptsMapping> subconcepts = programConceptsMappingRepository.findByUnit_UnitId(unitId);
        return subconcepts.size();
    }
 // Helper to determine if a stage is enabled
    private boolean determineStageEnabled(int stageIndex, boolean delayedStageUnlock, int delayInDays, OffsetDateTime currentDate, OffsetDateTime previousStageCompletionDate, String stageCompletionStatus) {
        if (stageIndex == 0) {
            return true; // First stage is always enabled
        }

        if (delayedStageUnlock && previousStageCompletionDate != null) {
            OffsetDateTime unlockDate = previousStageCompletionDate.plusDays(delayInDays);
            return !currentDate.isBefore(unlockDate);
        }

        return "yes".equals(stageCompletionStatus);
    }
}
