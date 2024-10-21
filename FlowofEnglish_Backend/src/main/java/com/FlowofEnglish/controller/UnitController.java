package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    // Create Unit
    @PostMapping("/create")
    public ResponseEntity<Unit> createUnit(@RequestBody Unit unit) {
        Unit createdUnit = unitService.createUnit(unit);
        return ResponseEntity.ok(createdUnit);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> bulkUploadUnits(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = unitService.bulkUploadUnits(file);
        return ResponseEntity.ok(response);
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