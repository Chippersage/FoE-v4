package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.StageDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.model.UserSubConcept;
import com.FlowofEnglish.repository.ProgramRepository;
import com.FlowofEnglish.repository.StageRepository;
import com.FlowofEnglish.repository.UnitRepository;
import com.FlowofEnglish.repository.UserSubConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.FlowofEnglish.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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
    public ProgramDTO getProgramWithStagesAndUnits(String programId) {
        // Fetch the program details
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("Program not found"));

        ProgramDTO programResponse = new ProgramDTO();
        programResponse.setProgramId(program.getProgramId());
        programResponse.setProgramName(program.getProgramName());
        programResponse.setProgramDesc(program.getProgramDesc());
        
     // Get the currently authenticated user's userId
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // Assuming the userId is the principal name


        // Fetch stages for the program
        List<Stage> stages = stageRepository.findByProgram_ProgramId(programId);
        Map<String, StageDTO> stageMap = new HashMap<>(); 
        int totalUnitCount = 0; // Variable to keep track of total units
        int stagesCount = 0; // Variable to count the stages

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

            // Iterate through units and build the unit map
            for (int j = 0; j < units.size(); j++) {
                Unit unit = units.get(j);
                UnitResponseDTO unitResponse = new UnitResponseDTO();
                unitResponse.setUnitId(unit.getUnitId());
                unitResponse.setUnitName(unit.getUnitName());
                unitResponse.setUnitDesc(unit.getUnitDesc());

                // Check completion status from UserSubConcept
                Optional<UserSubConcept> userSubConcept = userSubConceptRepository
                    .findByUser_UserIdAndUnit_UnitId(userId, unit.getUnitId());
                String completionStatus = userSubConcept.isPresent() ? "yes" : "no";
                unitResponse.setCompletionStatus(completionStatus);

                // If any unit is not completed, mark the stage as not completed
                if (!"yes".equals(completionStatus)) {
                    stageCompleted = true;
                }

                // Use index as the key for unit map
                unitMap.put(String.valueOf(j), unitResponse);
                totalUnitCount++; // Increment the total unit count
            }

            // Add units to the stage response
            stageResponse.setUnits(unitMap);
            stageResponse.setStageCompletionStatus(stageCompleted ? "yes" : "no");

            // Use index as the key for stage map
            stageMap.put(String.valueOf(i), stageResponse);
            stagesCount++; // Increment the stage count
        }

        // Set stagesCount and unitCount in the program response
        programResponse.setStages(stageMap);
        programResponse.setStagesCount(stagesCount);
        programResponse.setUnitCount(totalUnitCount);

        return programResponse;
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
//
//
//import com.FlowofEnglish.dto.UnitResponseDTO;
//import com.FlowofEnglish.model.Unit;
//import com.FlowofEnglish.repository.UnitRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class UnitServiceImpl implements UnitService {
//
//    @Autowired
//    private UnitRepository unitRepository;
////
////    @Override
////    public List<UnitResponseDTO> getAllUnits() {
////        return unitRepository.findAll();
////    }
//    
//    
////    @Override
////    public List<UnitResponseDTO> getAllUnits() {
////        List<Unit> units = unitRepository.findAll(); // Fetch the list of Unit entities
////        return units.stream()
////                     .map(this::convertToDTO) // Convert each Unit to UnitResponseDTO
////                     .collect(Collectors.toList()); // Collect the results into a list
////    }
////
////    // Method to convert Unit to UnitResponseDTO
////    private UnitResponseDTO convertToDTO(Unit unit) {
////        UnitResponseDTO dto = new UnitResponseDTO();
////        // Set properties from unit to dto
////        dto.setUnitId(unit.getUnitId());
////        dto.setUnitName(unit.getUnitName());
////        // Add other properties as needed
////        return dto;
////    }
//    @Override
//    public List<UnitResponseDTO> getAllUnits() {
//        List<Unit> units = unitRepository.findAll(); // Replace with your actual method to get units
//        return units.stream().map(unit -> {
//            UnitResponseDTO dto = new UnitResponseDTO();
//            dto.setUnitId(unit.getUnitId());
//            dto.setUnitName(unit.getUnitName());
//            dto.setUnitDesc(unit.getUnitDesc());
//            // Set program and stage details as needed
//            return dto;
//        }).collect(Collectors.toList());
//    }
//
//    @Override
//    public Optional<Unit> getUnitById(String unitId) {
//        return unitRepository.findById(unitId);
//    }
//    //new
//    @Override
//    public Unit findById(String unitId) {
//        return unitRepository.findById(unitId)
//            .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
//    }
//
//
//    @Override
//    public List<Unit> getUnitsByProgramId(String programId) {
//        return unitRepository.findByProgramProgramId(programId);
//    }
//
//    @Override
//    public Unit createUnit(Unit unit) {
//        return unitRepository.save(unit);
//    }
//
//    @Override
//    public Unit updateUnit(String unitId, Unit updatedUnit) {
//        return unitRepository.findById(unitId)
//            .map(unit -> {
//                unit.setUnitName(updatedUnit.getUnitName());
//                unit.setUnitDesc(updatedUnit.getUnitDesc());
//                unit.setProgram(updatedUnit.getProgram());
//                return unitRepository.save(unit);
//            })
//            .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
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
//}
