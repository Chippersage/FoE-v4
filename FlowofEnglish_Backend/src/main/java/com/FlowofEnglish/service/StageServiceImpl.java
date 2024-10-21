package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.model.Stage;
import com.FlowofEnglish.repository.ProgramRepository;
import com.FlowofEnglish.repository.StageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class StageServiceImpl implements StageService {

    @Autowired
    private StageRepository stageRepository;
    
    @Autowired
    private ProgramRepository programRepository;

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
    public Map<String, Object> uploadStagesCSV(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<String> errorMessages = new ArrayList<>();
        int successfulInserts = 0;
        int failedInserts = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] data = line.split(",");
                String stageId = data[0];
                String stageName = data[1];
                String stageDesc = data[2];
                String programId = data[3];

                // Check if stageId exists in the database
                if (stageRepository.existsById(stageId)) {
                    errorMessages.add("Stage ID " + stageId + " already exists.");
                    failedInserts++;
                    continue;
                }

                // Fetch the program by programId
                Optional<Program> program = programRepository.findById(programId);
                if (program.isEmpty()) {
                    errorMessages.add("Program ID " + programId + " not found for Stage ID " + stageId);
                    failedInserts++;
                    continue;
                }

                // Check for duplicates within the CSV file
                if (stageRepository.findById(stageId).isPresent()) {
                    errorMessages.add("Duplicate Stage ID " + stageId + " in CSV.");
                    failedInserts++;
                    continue;
                }

                // If all validations pass, create the stage
                Stage newStage = new Stage(stageId, stageName, stageDesc, program.get(), UUID.randomUUID().toString());
                stageRepository.save(newStage);
                successfulInserts++;
            }

            result.put("successfulInserts", successfulInserts);
            result.put("failedInserts", failedInserts);
            result.put("errors", errorMessages);
        } catch (Exception e) {
            throw new RuntimeException("Error while processing CSV: " + e.getMessage());
        }

        return result;
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
