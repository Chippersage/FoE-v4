package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.model.Program;
import com.FlowofEnglish.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
