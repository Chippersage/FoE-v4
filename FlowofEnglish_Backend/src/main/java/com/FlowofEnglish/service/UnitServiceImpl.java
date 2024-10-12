package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.StageDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.ProgramConceptsMapping;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
import com.FlowofEnglish.repository.ProgramRepository;
import com.FlowofEnglish.repository.StageRepository;
import com.FlowofEnglish.repository.UnitRepository;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.FlowofEnglish.exception.ResourceNotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UnitServiceImpl implements UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private StageRepository stageRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private UserSubConceptRepository userSubConceptRepository;
    
    @Autowired
    private ProgramConceptsMappingRepository programConceptsMappingRepository;

    @Override
    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
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
    public ProgramDTO getProgramWithStagesAndUnits(String userId, String programId) {
        // Fetch the program details
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));

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
        
        boolean previousStageCompleted = true;  // Flag to determine if the previous stage is completed
        boolean programCompleted = true;  // Track if the entire program is complete

        // Iterate through stages and build the stage map
        for (int i = 0; i < stages.size(); i++) {
            Stage stage = stages.get(i);
            StageDTO stageResponse = new StageDTO();
            stageResponse.setStageId(stage.getStageId());
            stageResponse.setStageName(stage.getStageName());
            stageResponse.setStageDesc(stage.getStageDesc());

            // Fetch units for each stage
            List<Unit> units = unitRepository.findByStage_StageId(stage.getStageId());
            Map<String, UnitResponseDTO> unitMap = new HashMap<>();
            
            boolean stageCompleted = true;
            
            if (units.isEmpty()) {
                stageResponse.setStageCompletionStatus("There are no units and subconcepts in this stage");
            } else {
  
                for (int j = 0; j < units.size(); j++) {
                    Unit unit = units.get(j);
                    UnitResponseDTO unitResponse = new UnitResponseDTO();
                    unitResponse.setUnitId(unit.getUnitId());
                    unitResponse.setUnitName(unit.getUnitName());
                    unitResponse.setUnitDesc(unit.getUnitDesc());

                    // Fetch user subconcepts for the current unit
                    List<UserSubConcept> userSubConceptsForUnit = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(userId, unit.getUnitId());

                    // Fetch the total number of subconcepts associated with the unit
                    int totalSubConceptCount = getTotalSubConceptCount(unit.getUnitId());
                    int completedSubConceptCount = userSubConceptsForUnit.size();

                    String unitCompletionStatus;
                    
                    if (totalSubConceptCount == 0) {
                        // No subconcepts in the unit
                        unitCompletionStatus = "No subconcepts in this unit";
                    } else if (completedSubConceptCount == totalSubConceptCount) {
                        // All subconcepts completed
                        unitCompletionStatus = "yes";
                    } else {
                        // Check the previous unit's completion status for enabling/disabling logic
                        if (j > 0) {
                            Unit previousUnit = units.get(j - 1);
                            String previousUnitStatus = unitMap.get(String.valueOf(j - 1)).getCompletionStatus();

                            if ("yes".equals(previousUnitStatus)) {
                                // Mark this unit as incomplete if the previous unit is completed
                                unitCompletionStatus = "incomplete";
                            }else {
                        // No subconcepts completed, unit is locked
                        unitCompletionStatus = "disabled";
                            }
                    }else {
                        // First unit logic (first unit in the stage)
                        unitCompletionStatus = completedSubConceptCount > 0 ? "incomplete" : "disabled";
                    }

                    stageCompleted = false; // As this unit is not fully completed
                    programCompleted = false; // At least one unit is not completed
                }

                // Set the unit status and add it to the unit map
                unitResponse.setCompletionStatus(unitCompletionStatus);
                unitMap.put(String.valueOf(j), unitResponse);
                totalUnitCount++;
                }

                // Check if all units are completed to mark the stage as completed
                boolean allUnitsCompleted = unitMap.values().stream()
                    .allMatch(unitResp -> "yes".equals(unitResp.getCompletionStatus()));
                
                stageResponse.setUnits(unitMap);
                stageResponse.setStageCompletionStatus(allUnitsCompleted ? "yes" : "no");
            }
            
            
         // Set stage enabled status based on previous stage completion
            if (i == 0) {
                // Enable the first stage by default
                stageResponse.setStageEnabled(true);
            } else {
                // Enable this stage only if the previous stage was completed
                stageResponse.setStageEnabled(previousStageCompleted && !units.isEmpty());
            }
            
         // Update previousStageCompleted for the next iteration
            previousStageCompleted = stageCompleted;

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
     * Helper method to get the total subconcept count for a unit.
     */
    private int getTotalSubConceptCount(String unitId) {
        List<ProgramConceptsMapping> subconcepts = programConceptsMappingRepository.findByUnit_UnitId(unitId);
        return subconcepts.size();
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
}







// check whether all units within a stage are completed usingThis
//boolean allUnitsCompleted = unitMap.values().stream()
//.allMatch(unitResp -> "yes".equals(unitResp.getCompletionStatus()));

//For each unit, you calculate whether subconcepts are completed usingThis
//int totalSubConceptCount = getTotalSubConceptCount(unit.getUnitId());
//int completedSubConceptCount = userSubConceptsForUnit.size();
