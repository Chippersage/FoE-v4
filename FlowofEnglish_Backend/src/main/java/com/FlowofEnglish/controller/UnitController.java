package com.FlowofEnglish.controller;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.StageDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping
    public List<Unit> getAllUnits() {
        return unitService.getAllUnits();
    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Unit> getUnitById(@PathVariable String id) {
//        return unitService.getUnitById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
    
    @GetMapping("/{unitId}")
    public ResponseEntity<UnitResponseDTO> getUnitById(@PathVariable String unitId) {
        Unit unit = unitService.findById(unitId);

        UnitResponseDTO response = new UnitResponseDTO();
        response.setUnitId(unit.getUnitId());
        
        Program program = unit.getProgram();
        ProgramDTO programDTO = new ProgramDTO();
        programDTO.setProgramId(program.getProgramId());
        programDTO.setProgramName(program.getProgramName());
        programDTO.setProgramDesc(program.getProgramDesc());
        response.setProgram(programDTO);

        Stage stage = unit.getStage();
        StageDTO stageDTO = new StageDTO();
        stageDTO.setStageId(stage.getStageId());
        stageDTO.setStageName(stage.getStageName());
        stageDTO.setStageDesc(stage.getStageDesc());
        response.setStage(stageDTO);

        response.setUnitDesc(unit.getUnitDesc());
        response.setUnitName(unit.getUnitName());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/program/{programId}")
    public List<Unit> getUnitsByProgramId(@PathVariable String programId) {
        return unitService.getUnitsByProgramId(programId);
    }

    @PostMapping("/create")
    public Unit createUnit(@RequestBody Unit unit) {
        return unitService.createUnit(unit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable String id, @RequestBody Unit unit) {
        try {
            return ResponseEntity.ok(unitService.updateUnit(id, unit));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable String id) {
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteUnits(@RequestBody List<String> ids) {
        unitService.deleteUnits(ids);
        return ResponseEntity.noContent().build();
    }
}
