package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.*;
import com.FlowofEnglish.model.Unit;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;

public interface UnitService {
   
	ProgramDTO getProgramWithStagesAndUnits(String userid, String programId); 
	Unit createUnit(Unit unit);
    Unit updateUnit(String unitId, Unit unit);
    Unit getUnitById(String unitId);
    void deleteUnit(String unitId);
    void deleteUnits(List<String> unitIds);
    List<UnitResponseDTO> getAllUnits(); 
    Map<String, Object> bulkUploadUnits(MultipartFile file);
    Map<String, Object> bulkUpdateUnits(MultipartFile file);
	Optional<Unit> findByUnitId(String unitId);
}
