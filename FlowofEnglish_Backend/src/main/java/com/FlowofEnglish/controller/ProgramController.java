package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.service.ProgramService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/programs")
public class ProgramController {

    @Autowired
    private ProgramService programService;

    @GetMapping
    public List<Program> getAllPrograms() {
        return programService.getAllPrograms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable String id) {
        return programService.getProgramById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public Program createProgram(@RequestBody Program program) {
        return programService.createProgram(program);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadProgramsCSV(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = programService.uploadProgramsCSV(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of("error", "Failed to upload programs: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<Program> updateProgram(@PathVariable String id, @RequestBody Program program) {
        try {
            return ResponseEntity.ok(programService.updateProgram(id, program));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable String id) {
        programService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deletePrograms(@RequestBody List<String> ids) {
        programService.deletePrograms(ids);
        return ResponseEntity.noContent().build();
    }
}
