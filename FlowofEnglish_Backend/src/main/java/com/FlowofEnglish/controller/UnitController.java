package com.FlowofEnglish.controller;

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

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable String id) {
        return unitService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
