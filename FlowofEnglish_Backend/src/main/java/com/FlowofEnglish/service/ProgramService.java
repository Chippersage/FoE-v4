package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.model.Program;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface ProgramService {

    List<Program> getAllPrograms();
    
    Optional<Program> findByProgramId(String programId);

    Optional<Program> getProgramById(String programId);

    Program createProgram(Program program);

    Program updateProgram(String programId, Program program);

    void deleteProgram(String programId);

    void deletePrograms(List<String> programIds);

	ProgramDTO convertToDTO(Program program);
	
	Map<String, Object> uploadProgramsCSV(MultipartFile file);
}
