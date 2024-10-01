package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    // Create Unit
    @PostMapping
    public ResponseEntity<Unit> createUnit(@RequestBody Unit unit) {
        Unit createdUnit = unitService.createUnit(unit);
        return ResponseEntity.ok(createdUnit);
    }

    // Update Unit
    @PutMapping("/{unitId}")
    public ResponseEntity<Unit> updateUnit(@PathVariable String unitId, @RequestBody Unit unit) {
        Unit updatedUnit = unitService.updateUnit(unitId, unit);
        return ResponseEntity.ok(updatedUnit);
    }

    // Get Unit by ID
    @GetMapping("/{unitId}")
    public ResponseEntity<Unit> getUnitById(@PathVariable String unitId) {
        Unit unit = unitService.getUnitById(unitId);
        return ResponseEntity.ok(unit);
    }
    
//    @GetMapping("/{programId}")
//    public ResponseEntity<ProgramDTO> getProgramWithStagesAndUnits(@PathVariable String programId, @RequestParam String userId) {
//        ProgramDTO response = unitService.getProgramWithStagesAndUnits(programId, userId);
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
    @GetMapping("{userId}/program/{programId}")
    public ResponseEntity<ProgramDTO> getProgramWithStagesAndUnits(@PathVariable String userId, @PathVariable String programId) {
        ProgramDTO response = unitService.getProgramWithStagesAndUnits(userId, programId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }



    // Delete Unit
    @DeleteMapping("/{unitId}")
    public ResponseEntity<Void> deleteUnit(@PathVariable String unitId) {
        unitService.deleteUnit(unitId);
        return ResponseEntity.noContent().build();
    }

    // Get All Units with custom response
    @GetMapping
    public ResponseEntity<List<UnitResponseDTO>> getAllUnits() {
        List<UnitResponseDTO> units = unitService.getAllUnits();
        return ResponseEntity.ok(units);
    }
}










//package com.FlowofEnglish.controller;
//import java.util.List;
//import java.util.Optional;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.FlowofEnglish.dto.ProgramDTO;
//import com.FlowofEnglish.dto.StageDTO;
//import com.FlowofEnglish.dto.UnitResponseDTO;
//import com.FlowofEnglish.dto.UserDTO;
//import com.FlowofEnglish.model.Program;
//import com.FlowofEnglish.model.Stage;
//import com.FlowofEnglish.model.Unit;
//import com.FlowofEnglish.model.User;
//import com.FlowofEnglish.model.UserSubConcept;
//import com.FlowofEnglish.service.SubconceptService;
//import com.FlowofEnglish.service.UnitService;
//import com.FlowofEnglish.service.UserService;
//import com.FlowofEnglish.service.UserSubConceptService;
//
//@RestController
//@RequestMapping("/api/v1/units")
//public class UnitController {
//
//    @Autowired
//    private UnitService unitService;
//
//    @Autowired
//    private UserSubConceptService userSubConceptService;  
//    
//    @Autowired
//    private UserService userService;  
//
//    @GetMapping("/{unitId}/user/{userId}")
//    public ResponseEntity<UnitResponseDTO> getUnitWithCompletionStatus(@PathVariable String unitId, @PathVariable String userId) {
//        Unit unit = unitService.findById(unitId);
//        
//        if (unit == null) {
//            return ResponseEntity.notFound().build();
//        }
//
//        // Prepare response DTO
//        UnitResponseDTO response = new UnitResponseDTO();
//        response.setUnitId(unit.getUnitId());
//        response.setUnitName(unit.getUnitName());
//        response.setUnitDesc(unit.getUnitDesc());
//
//        // Fetch program details
//        Program program = unit.getProgram();
//        if (program != null) {
//            ProgramDTO programDTO = new ProgramDTO();
//            programDTO.setProgramId(program.getProgramId());
//            programDTO.setProgramName(program.getProgramName());
//            programDTO.setProgramDesc(program.getProgramDesc());
//            response.setProgram(programDTO);
//        }
//
//        // Fetch stage details
//        Stage stage = unit.getStage();
//        if (stage != null) {
//            StageDTO stageDTO = new StageDTO();
//            stageDTO.setStageId(stage.getStageId());
//            stageDTO.setStageName(stage.getStageName());
//            stageDTO.setStageDesc(stage.getStageDesc());
//            response.setStage(stageDTO);
//        }
//
//        // Fetch user's completion status from UserSubConcept
//        Optional<UserSubConcept> userSubConceptOpt = SubconceptService.findByUser_UserIdAndUnitId(userId, unitId);
//        response.setCompletionStatus(userSubConceptOpt.isPresent() ? "completed" : "not completed");
//
//        // Fetch user details
//        Optional<User> userOpt = UnitService.findByUserId(userId);
//        if (userOpt.isPresent()) {
//            UserDTO userDTO = new UserDTO();
//            User user = userOpt.get();
//            userDTO.setUserId(user.getUserId());
//            response.setUser(userDTO);
//        }
//
//        return ResponseEntity.ok(response);
//    }
//
//    // Other methods remain unchanged, but ensure they utilize UnitResponseDTO where applicable
//    @GetMapping
//    public List<UnitResponseDTO> getAllUnits() {
//        return unitService.getAllUnits();
//    }
//    
//    @PostMapping("/create")
//    public Unit createUnit(@RequestBody Unit unit) {
//        return unitService.createUnit(unit);
//    }
//}
//





//package com.FlowofEnglish.controller;
//
//import com.FlowofEnglish.dto.ProgramDTO;
//import com.FlowofEnglish.dto.StageDTO;
//import com.FlowofEnglish.dto.UnitResponseDTO;
//import com.FlowofEnglish.dto.UserDTO;
//import com.FlowofEnglish.model.Program;
//import com.FlowofEnglish.model.Stage;
//import com.FlowofEnglish.model.Unit;
//import com.FlowofEnglish.model.User;
//import com.FlowofEnglish.model.UserSubConcept;
//import com.FlowofEnglish.service.UnitService;
//import com.FlowofEnglish.service.UserService;
//import com.FlowofEnglish.service.UserSubConceptService;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/v1/units")
//public class UnitController {
//
//    @Autowired
//    private UnitService unitService;
//    
////    @Autowired
////    private UserSubConceptService userSubConceptService;  // Inject UserSubConceptService
////    
////    @Autowired
////    private UserService userService;  // Assuming you have a UserService to fetch user details
//
//
////    @GetMapping("/unit/{unitId}/user/{userId}")
////    public ResponseEntity<UnitResponseDTO> getUnitWithCompletionStatus(@PathVariable String unitId, @PathVariable String userId) {
////        // Fetch unit details
////        Unit unit = unitService.findById(unitId);
////
////        // Fetch user's completion status from UserSubConcept
////       // Optional<UserSubConcept> userSubConceptOpt = userSubConceptService.findByUserIdAndUnitId(userId, unitId);
////
////        // Prepare response DTO
////        UnitResponseDTO response = new UnitResponseDTO();
////        response.setUnitId(unit.getUnitId());
////
////        Program program = unit.getProgram();
////        ProgramDTO programDTO = new ProgramDTO();
////        programDTO.setProgramId(program.getProgramId());
////        programDTO.setProgramName(program.getProgramName());
////        programDTO.setProgramDesc(program.getProgramDesc());
////        response.setProgram(programDTO);
////
////        Stage stage = unit.getStage();
////        StageDTO stageDTO = new StageDTO();
////        stageDTO.setStageId(stage.getStageId());
////        stageDTO.setStageName(stage.getStageName());
////        stageDTO.setStageDesc(stage.getStageDesc());
////        response.setStage(stageDTO);
////
////        response.setUnitName(unit.getUnitName());
////        response.setUnitDesc(unit.getUnitDesc());
////
////        
////     // Fetch user details using userId
////        Optional<User> userOpt = userService.findByUserId(userId);  // Assuming you have this method
////        if (userOpt.isPresent()) {
////            UserDTO userDTO = new UserDTO();
////            User user = userOpt.get();
////            userDTO.setUserId(user.getUserId());
////            response.setUser(userDTO);
////        }
////        // Map user completion status
//////        User user = unit.getUser();
//////        UserDTO userDTO = new UserDTO();
//////        userDTO.setUserId(user.getUserId());
//////        response.setUser(userDTO);
//////        response.setCompletionStatus(userSubConceptOpt.isPresent() ? "yes" : "no");
////
////        return ResponseEntity.ok(response);
////    }
//
//
//    @GetMapping
//    public List<Unit> getAllUnits() {
//        return unitService.getAllUnits();
//    }
//    
//    
////
////    @GetMapping("/{id}")
////    public ResponseEntity<Unit> getUnitById(@PathVariable String id) {
////        return unitService.getUnitById(id)
////                .map(ResponseEntity::ok)
////                .orElse(ResponseEntity.notFound().build());
////    }
//    
//    @GetMapping("/{unitId}")
//    public ResponseEntity<UnitResponseDTO> getUnitById(@PathVariable String unitId) {
//        Unit unit = unitService.findById(unitId);
//
//        UnitResponseDTO response = new UnitResponseDTO();
//        response.setUnitId(unit.getUnitId());
//        
//        Program program = unit.getProgram();
//        ProgramDTO programDTO = new ProgramDTO();
//        programDTO.setProgramId(program.getProgramId());
//        programDTO.setProgramName(program.getProgramName());
//        programDTO.setProgramDesc(program.getProgramDesc());
//        response.setProgram(programDTO);
//
//        Stage stage = unit.getStage();
//        StageDTO stageDTO = new StageDTO();
//        stageDTO.setStageId(stage.getStageId());
//        stageDTO.setStageName(stage.getStageName());
//        stageDTO.setStageDesc(stage.getStageDesc());
//        response.setStage(stageDTO);
//
//        response.setUnitDesc(unit.getUnitDesc());
//        response.setUnitName(unit.getUnitName());
//
//        return ResponseEntity.ok(response);
//    }
//
//
//    @GetMapping("/program/{programId}")
//    public List<Unit> getUnitsByProgramId(@PathVariable String programId) {
//        return unitService.getUnitsByProgramId(programId);
//    }
//
//    @PostMapping("/create")
//    public Unit createUnit(@RequestBody Unit unit) {
//        return unitService.createUnit(unit);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Unit> updateUnit(@PathVariable String id, @RequestBody Unit unit) {
//        try {
//            return ResponseEntity.ok(unitService.updateUnit(id, unit));
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteUnit(@PathVariable String id) {
//        unitService.deleteUnit(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @PostMapping("/delete")
//    public ResponseEntity<Void> deleteUnits(@RequestBody List<String> ids) {
//        unitService.deleteUnits(ids);
//        return ResponseEntity.noContent().build();
//    }
//}
