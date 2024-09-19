package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.model.Program;
import java.util.List;
import java.util.Optional;

public interface ProgramService {

    List<Program> getAllPrograms();

    Optional<Program> getProgramById(String programId);

    Program createProgram(Program program);

    Program updateProgram(String programId, Program program);

    void deleteProgram(String programId);

    void deletePrograms(List<String> programIds);

	ProgramDTO convertToDTO(Program program);
}
