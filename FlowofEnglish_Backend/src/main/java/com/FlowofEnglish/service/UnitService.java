package com.FlowofEnglish.service;

import com.FlowofEnglish.model.Unit;
import java.util.List;
import java.util.Optional;

public interface UnitService {

    List<Unit> getAllUnits();

    Optional<Unit> getUnitById(String unitId);

    List<Unit> getUnitsByProgramId(String programId);

    Unit createUnit(Unit unit);

    Unit updateUnit(String unitId, Unit unit);

    void deleteUnit(String unitId);

    void deleteUnits(List<String> unitIds);

	Unit findById(String unitId);
}
