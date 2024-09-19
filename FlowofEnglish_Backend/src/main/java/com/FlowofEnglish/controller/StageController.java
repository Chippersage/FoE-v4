package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.service.StageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/stages")
public class StageController {

    @Autowired
    private StageService stageService;

    @GetMapping
    public List<Stage> getAllStages() {
        return stageService.getAllStages();
    }

    @GetMapping("/{stageId}")
    public ResponseEntity<Stage> getStageById(@PathVariable String stageId) {
        Optional<Stage> stage = stageService.getStageById(stageId);
        return stage.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public Stage createStage(@RequestBody Stage stage) {
        return stageService.createStage(stage);
    }

    @PutMapping("/{stageId}")
    public ResponseEntity<Stage> updateStage(@PathVariable String stageId, @RequestBody Stage stage) {
        return ResponseEntity.ok(stageService.updateStage(stageId, stage));
    }

    @DeleteMapping("/{stageId}")
    public ResponseEntity<Void> deleteStage(@PathVariable String stageId) {
        stageService.deleteStage(stageId);
        return ResponseEntity.noContent().build();
    }
}
