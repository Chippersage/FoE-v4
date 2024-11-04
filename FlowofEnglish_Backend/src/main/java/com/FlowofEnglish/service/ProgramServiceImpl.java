package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.repository.ProgramRepository;
import com.opencsv.CSVReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ProgramServiceImpl implements ProgramService {

    @Autowired
    private ProgramRepository programRepository;

    @Override
    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    @Override
    public Optional<Program> getProgramById(String programId) {
        return programRepository.findById(programId);
    }

    @Override
    public Program createProgram(Program program) {
        return programRepository.save(program);
    }
    
    @Override
    public Optional<Program> findByProgramId(String programId) {
        return programRepository.findByProgramId(programId);
    }
    
    
    @Override
    public Map<String, Object> uploadProgramsCSV(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        int createdCount = 0;
        int failedCount = 0;
        List<String> failedIds = new ArrayList<>();
        Set<String> csvProgramIds = new HashSet<>(); // To track duplicates in the CSV file

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();

            for (int i = 1; i < records.size(); i++) { // Skip header row
                String[] record = records.get(i);
                String programId = record[0]; // Assuming programId is the first column

                // Check for duplicate programId in the CSV file
                if (!csvProgramIds.add(programId)) {
                    failedCount++;
                    failedIds.add("Row " + (i+1) + ": Program ID '" + programId + "' is duplicated in the CSV.");
                    continue;
                }

                // Check if programId already exists in the database
                if (programRepository.existsById(programId)) {
                    failedCount++;
                    failedIds.add("Row " + (i+1) + ": Program ID '" + programId + "' already exists in the database.");
                    continue;
                }

                // Create and populate the Program entity
                Program program = new Program();
                program.setProgramId(programId);
                program.setStages(Integer.parseInt(record[1])); // Assuming stages is the second column
                program.setUnitCount(Integer.parseInt(record[2])); // Assuming unit count is the third column
                program.setProgramDesc(record[3]); // Assuming description is the fourth column
                program.setProgramName(record[4]); // Assuming name is the fifth column
                program.setUuid(UUID.randomUUID().toString()); // Generate UUID

                // Save the valid program to the database
                programRepository.save(program);
                createdCount++;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process CSV file: " + e.getMessage());
        }

        result.put("createdCount", createdCount);
        result.put("failedCount", failedCount);
        result.put("failedIds", failedIds);
        return result;
    }

    @Override
    public Program updateProgram(String programId, Program updatedProgram) {
        return programRepository.findById(programId)
            .map(program -> {
                program.setProgramName(updatedProgram.getProgramName());
                program.setProgramDesc(updatedProgram.getProgramDesc());
                program.setStages(updatedProgram.getStages());
                program.setUnitCount(updatedProgram.getUnitCount());
                return programRepository.save(program);
            })
            .orElseThrow(() -> new IllegalArgumentException("Program not found"));
    }

    @Override
    public void deleteProgram(String programId) {
        programRepository.deleteById(programId);
    }

    @Override
    public void deletePrograms(List<String> programIds) {
        programRepository.deleteAllById(programIds);
    }

    // Implementation of convertToDTO
    @Override
    public ProgramDTO convertToDTO(Program program) {
        ProgramDTO dto = new ProgramDTO();
        dto.setProgramId(program.getProgramId());
        dto.setProgramName(program.getProgramName());
        dto.setProgramDesc(program.getProgramDesc());
        dto.setStagesCount(program.getStages());
        dto.setUnitCount(program.getUnitCount());
        return dto;
    }
}
