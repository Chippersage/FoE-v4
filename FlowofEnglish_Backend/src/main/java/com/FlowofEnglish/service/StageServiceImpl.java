package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.repository.StageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StageServiceImpl implements StageService {

    @Autowired
    private StageRepository stageRepository;

    @Override
    public List<Stage> getAllStages() {
        return stageRepository.findAll();
    }

    @Override
    public Optional<Stage> getStageById(String stageId) {
        return stageRepository.findById(stageId);
    }

    @Override
    public Stage createStage(Stage stage) {
        return stageRepository.save(stage);
    }

    @Override
    public Stage updateStage(String stageId, Stage stage) {
        return stageRepository.findById(stageId).map(existingStage -> {
            existingStage.setStageName(stage.getStageName());
            existingStage.setStageDesc(stage.getStageDesc());
            existingStage.setProgram(stage.getProgram());
            existingStage.setUuid(stage.getUuid());
            return stageRepository.save(existingStage);
        }).orElseThrow(() -> new RuntimeException("Stage not found"));
    }

    @Override
    public void deleteStage(String stageId) {
        stageRepository.deleteById(stageId);
    }
}
