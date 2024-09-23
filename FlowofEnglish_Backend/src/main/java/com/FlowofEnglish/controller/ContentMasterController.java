package com.FlowofEnglish.controller;

import com.FlowofEnglish.model.ContentMaster;
import com.FlowofEnglish.service.ContentMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/content-masters")
public class ContentMasterController {

    @Autowired
    private ContentMasterService contentMasterService;

    @GetMapping
    public ResponseEntity<List<ContentMaster>> getContents() {
        List<ContentMaster> contents = contentMasterService.getAllContents();
        return ResponseEntity.ok(contents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentMaster> getContentById(@PathVariable int id) {
        Optional<ContentMaster> content = contentMasterService.getContentById(id);
        return content.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<ContentMaster> createContent(@RequestBody ContentMaster content) {
        ContentMaster newContent = contentMasterService.createContent(content);
        return ResponseEntity.ok(newContent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentMaster> updateContent(@PathVariable int id, @RequestBody ContentMaster content) {
        ContentMaster updatedContent = contentMasterService.updateContent(id, content);
        return updatedContent != null ? ResponseEntity.ok(updatedContent) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable int id) {
        contentMasterService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}