package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Stage;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface StageService {
    List<Stage> getAllStages();
    Optional<Stage> getStageById(String stageId);
    Stage createStage(Stage stage);
    Stage updateStage(String stageId, Stage stage);
    void deleteStage(String stageId);
    Map<String, Object> uploadStagesCSV(MultipartFile file);
}