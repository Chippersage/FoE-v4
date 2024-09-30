package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.StageDTO;
import com.FlowofEnglish.dto.SubconceptResponseDTO;
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
        int totalUnitCount = 0; // Variable to keep track of total units
        int stagesCount = 0; // Variable to count the stages
        
        // Fetch all UserSubConcepts for the user and unit to track completion
        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
        
        boolean programCompleted = true; // Track if the entire program is complete
        
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
            boolean stageCompleted = true; // Track if the stage is complete
            
            // Iterate through units and build the unit map
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
                
                if (completedSubConceptCount == totalSubConceptCount) {
                    // All subconcepts completed, mark the unit as completed
                    unitCompletionStatus = "yes"; 
                } else if (completedSubConceptCount > 0) {
                    // Some subconcepts are completed, unit is incomplete
                    unitCompletionStatus = "incomplete";
                    stageCompleted = false;  // Mark the stage as incomplete
                    programCompleted = false;  // Mark the program as incomplete
                } else {
                    // No subconcepts completed, unit is locked
                    unitCompletionStatus = "disabled";
                    stageCompleted = false;  // Mark the stage as incomplete
                    programCompleted = false;  // Mark the program as incomplete
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

            // Add the stage to the response
            stageMap.put(String.valueOf(i), stageResponse);
            stagesCount++; // Increment the stage count
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








//package com.FlowofEnglish.service;
//
//import com.FlowofEnglish.dto.ProgramDTO;
//import com.FlowofEnglish.dto.StageDTO;
//import com.FlowofEnglish.dto.SubconceptResponseDTO;
//import com.FlowofEnglish.dto.UnitResponseDTO;
//import com.FlowofEnglish.model.Program;
//import com.FlowofEnglish.model.ProgramConceptsMapping;
//import com.FlowofEnglish.model.Stage;
//import com.FlowofEnglish.model.Unit;
//import com.FlowofEnglish.model.UserSubConcept;
//import com.FlowofEnglish.repository.ProgramConceptsMappingRepository;
//import com.FlowofEnglish.repository.ProgramRepository;
//import com.FlowofEnglish.repository.StageRepository;
//import com.FlowofEnglish.repository.UnitRepository;
//import com.FlowofEnglish.repository.UserSubConceptRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import com.FlowofEnglish.exception.ResourceNotFoundException;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class UnitServiceImpl implements UnitService {
//
//    @Autowired
//    private UnitRepository unitRepository;
//
//    @Autowired
//    private StageRepository stageRepository;
//
//    @Autowired
//    private ProgramRepository programRepository;
//
//    @Autowired
//    private UserSubConceptRepository userSubConceptRepository;
//    
//    @Autowired
//    private ProgramConceptsMappingRepository programConceptsMappingRepository;
//
//    @Override
//    public Unit createUnit(Unit unit) {
//        return unitRepository.save(unit);
//    }
//
//    @Override
//    public Unit updateUnit(String unitId, Unit unit) {
//        Optional<Unit> existingUnit = unitRepository.findById(unitId);
//        if (existingUnit.isPresent()) {
//            Unit updatedUnit = existingUnit.get();
//            updatedUnit.setUnitName(unit.getUnitName());
//            updatedUnit.setUnitDesc(unit.getUnitDesc());
//            updatedUnit.setProgram(unit.getProgram());
//            updatedUnit.setStage(unit.getStage());
//            return unitRepository.save(updatedUnit);
//        }
//        throw new RuntimeException("Unit not found with id: " + unitId);
//    }
//
//    @Override
//    public Unit getUnitById(String unitId) {
//        return unitRepository.findById(unitId)
//                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + unitId));
//    }
//   
//    @Override 
//   	public	ProgramDTO getProgramWithStagesAndUnits(String userid, String programId) {
//        // Fetch the program details
//        Program program = programRepository.findById(programId)
//            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
//
//        ProgramDTO programResponse = new ProgramDTO();
//        programResponse.setProgramId(program.getProgramId());
//        programResponse.setProgramName(program.getProgramName());
//        programResponse.setProgramDesc(program.getProgramDesc());
//        
//        
//        // Fetch stages for the program
//        List<Stage> stages = stageRepository.findByProgram_ProgramId(programId);
//        Map<String, StageDTO> stageMap = new HashMap<>(); 
//        int totalUnitCount = 0; // Variable to keep track of total units
//        int stagesCount = 0; // Variable to count the stages
//        
//       
//     // Fetch all UserSubConcepts for the user and unit to track completion
//        List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndProgram_ProgramId(userId, programId);
//        
//        boolean programCompleted = true; // Track if the entire program is complete
//        
//     // Keep track of the enabled state of units
//        boolean enableNextUnit = true; // Initially, the first unit is enabled
//
//     // Keep track of the enabled state of stage
//        boolean enableNextStage = true; // Initially, the first stage is enabled
//
//        // Iterate through stages and build the stage map
//        for (int i = 0; i < stages.size(); i++) {
//            Stage stage = stages.get(i);
//            StageDTO stageResponse = new StageDTO();
//            stageResponse.setStageId(stage.getStageId());
//            stageResponse.setStageName(stage.getStageName());
//            stageResponse.setStageDesc(stage.getStageDesc());
//
//            // Fetch units for each stage
//            List<Unit> units = unitRepository.findByStage_StageId(stage.getStageId());
//            Map<String, UnitResponseDTO> unitMap = new HashMap<>();
//            boolean stageCompleted = true;
//            
//            // Iterate through units and build the unit map
//            for (int j = 0; j < units.size(); j++) {
//                Unit unit = units.get(j);
//                UnitResponseDTO unitResponse = new UnitResponseDTO();
//                unitResponse.setUnitId(unit.getUnitId());
//                unitResponse.setUnitName(unit.getUnitName());
//                unitResponse.setUnitDesc(unit.getUnitDesc());
//                
//                // Fetch user subconcepts for the current unit
//                List<UserSubConcept> userSubConcepts = userSubConceptRepository.findByUser_UserIdAndUnit_UnitId(user.getUserId(), unit.getUnitId());
//                
//                // Fetch the total number of subconcepts associated with the unit
//                int totalSubConceptCount = getTotalSubConceptCount(unit.getUnitId());
//                int completedSubConceptCount = userSubConcepts.size();
//
//                String unitCompletionStatus;
//                
//                if (completedSubConceptCount == totalSubConceptCount) {
//                    // All subconcepts completed, mark the unit as completed
//                    unitCompletionStatus = "yes"; 
//                    enableNextUnit = true; // Allow the next unit to be enabled
//                } else if (completedSubConceptCount > 0 && enableNextUnit) {
//                    // Some subconcepts are completed, unit is incomplete but enabled
//                    unitCompletionStatus = "incomplete";
//                    stageCompleted = false;  // Mark the stage as incomplete
//                    programCompleted = false;  // Mark the program as incomplete
//                    enableNextUnit = false; // Disable the next unit since this one isn't fully completed
//                } else {
//                    // No subconcepts completed, unit is locked
//                    unitCompletionStatus = "disabled";
//                    stageCompleted = false;  // Mark the stage as incomplete
//                    programCompleted = false;  // Mark the program as incomplete
//                    enableNextUnit = false;  // Prevent further units from being enabled
//                }
//
//                // Set the unit status and add it to the unit map
//                unitResponse.setCompletionStatus(unitCompletionStatus);
//                unitMap.put(String.valueOf(j), unitResponse);
//                totalUnitCount++;
//            }
//         // Check if the current unit has been completed by the user
//            boolean isCompleted = userSubConcepts.stream()
//                .anyMatch(us -> us.getUnit().getUnitId().equals(mapping.getUnit().getUnitId()));
//
//            if (isCompleted) {
//            	unitResponseDTO.setCompletionStatus("yes");
//                enableNextUnit = true; // Enable the next subconcept if the current one is completed
//            } else if (enableNextUnit) {
//                // The next subconcept to be completed
//            	unitResponseDTO.setCompletionStatus("incomplete"); // Mark it as incomplete but enabled
//                enableNextUnit = false; // Disable all following subconcepts
//            } else {
//            	unitResponseDTO.setCompletionStatus("disabled"); // This subconcept is disabled until the previous one is completed
//            }
//
//            // Add to the map with an appropriate key (like an index or ID)
//            units.put(String.valueOf(units.size()), unitResponseDTO);
//            
//         // Increment the subconcept count
//            totalUnitCount++;
//        }
//     // Check if all units are completed to mark the stage as completed
//        boolean allUnitsCompleted = userSubConcepts.size() == totalUnitCount;
//
//     
//        // Add unit count to the response
//        responseDTO.settotalUnitCount(totalUnitCount); // Total number of units for this stage
//        responseDTO.setunits(units);
//        responseDTO.setUnitCompletionStatus(allUnitsCompleted ? "yes" : "no");
//
//        return Optional.of(responseDTO);
//    }
//            // Add units to the stage response
//            stageResponse.setUnits(unitMap);
//            stageResponse.setStageCompletionStatus(stageCompleted ? "yes" : "no");
//
//            // Enable or disable the stage based on whether the previous stage was completed
//            if (enableNextStage) {
//                stageResponse.setStageEnabled(true); // Enable current stage
//                enableNextStage = stageCompleted; // If stage is complete, enable the next one
//            } else {
//                stageResponse.setStageEnabled(false); // Disable current stage
//            }
//
//            // Add the stage to the response
//            stageMap.put(String.valueOf(i), stageResponse);
//            stagesCount++; // Increment the stage count
//        }
//
//        // Set stagesCount and unitCount in the program response
//        programResponse.setStages(stageMap);
//        programResponse.setStagesCount(stagesCount);
//        programResponse.setUnitCount(totalUnitCount);
//        programResponse.setProgramCompletionStatus(programCompleted ? "yes" : "no");
//
//        return programResponse;
//    }
//
//    /**
//     * Helper method to get the total subconcept count for a unit.
//     */
//    private int getTotalSubConceptCount(String unitId) {
//        List<ProgramConceptsMapping> subconcepts = programConceptsMappingRepository.findByUnit_UnitId(unitId);
//        return subconcepts.size();
//    }
//
//    @Override
//    public void deleteUnit(String unitId) {
//        unitRepository.deleteById(unitId);
//    }
//
//    @Override
//    public void deleteUnits(List<String> unitIds) {
//        unitRepository.deleteAllById(unitIds);
//    }
//
//    @Override
//    public List<UnitResponseDTO> getAllUnits() {
//        return unitRepository.findAll().stream()
//                .map(this::mapToDTO)
//                .collect(Collectors.toList());
//    }
//
//    private UnitResponseDTO mapToDTO(Unit unit) {
//        UnitResponseDTO dto = new UnitResponseDTO();
//        dto.setUnitId(unit.getUnitId());
//        dto.setUnitName(unit.getUnitName());
//        dto.setUnitDesc(unit.getUnitDesc());
//        return dto;
//    }
//}
