//package com.FlowofEnglish.controller;
//
//import com.FlowofEnglish.model.LevelUnitMapping;
//import com.FlowofEnglish.service.LevelUnitMappingService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/v1/levelunitmappings")
//public class LevelUnitMappingController {
//
//    @Autowired
//    private LevelUnitMappingService levelUnitMappingService;
//
//    @GetMapping
//    public List<LevelUnitMapping> getAllLevelUnitMappings() {
//        return levelUnitMappingService.getAllLevelUnitMappings();
//    }
//
//    @GetMapping("/{levelId}")
//    public ResponseEntity<LevelUnitMapping> getLevelUnitMappingById(@PathVariable String levelId) {
//        Optional<LevelUnitMapping> levelUnitMapping = levelUnitMappingService.getLevelUnitMappingById(levelId);
//        return levelUnitMapping.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @PostMapping("/create")
//    public LevelUnitMapping createLevelUnitMapping(@RequestBody LevelUnitMapping levelUnitMapping) {
//        return levelUnitMappingService.createLevelUnitMapping(levelUnitMapping);
//    }
//
//    @PutMapping("/{levelId}")
//    public ResponseEntity<LevelUnitMapping> updateLevelUnitMapping(@PathVariable String levelId, @RequestBody LevelUnitMapping levelUnitMapping) {
//        return ResponseEntity.ok(levelUnitMappingService.updateLevelUnitMapping(levelId, levelUnitMapping));
//    }
//
//    @DeleteMapping("/{levelId}")
//    public ResponseEntity<Void> deleteLevelUnitMapping(@PathVariable String levelId) {
//        levelUnitMappingService.deleteLevelUnitMapping(levelId);
//        return ResponseEntity.noContent().build();
//    }
//}
