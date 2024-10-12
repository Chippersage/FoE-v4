package com.FlowofEnglish.service;

import com.FlowofEnglish.dto.ProgramDTO;
import com.FlowofEnglish.dto.UnitResponseDTO;
import com.FlowofEnglish.model.Unit;

import java.util.List;

public interface UnitService {
   
	ProgramDTO getProgramWithStagesAndUnits(String userid, String programId); 
	Unit createUnit(Unit unit);
    Unit updateUnit(String unitId, Unit unit);
    Unit getUnitById(String unitId);
    void deleteUnit(String unitId);
    void deleteUnits(List<String> unitIds);
    List<UnitResponseDTO> getAllUnits(); 
}
