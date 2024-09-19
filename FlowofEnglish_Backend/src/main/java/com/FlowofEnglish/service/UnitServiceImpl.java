package com.FlowofEnglish.service;



import com.FlowofEnglish.model.Unit;
import com.FlowofEnglish.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UnitServiceImpl implements UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Override
    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    @Override
    public Optional<Unit> getUnitById(String unitId) {
        return unitRepository.findById(unitId);
    }
    //new
    @Override
    public Unit findById(String unitId) {
        return unitRepository.findById(unitId)
            .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
    }


    @Override
    public List<Unit> getUnitsByProgramId(String programId) {
        return unitRepository.findByProgramProgramId(programId);
    }

    @Override
    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }

    @Override
    public Unit updateUnit(String unitId, Unit updatedUnit) {
        return unitRepository.findById(unitId)
            .map(unit -> {
                unit.setUnitName(updatedUnit.getUnitName());
                unit.setUnitDesc(updatedUnit.getUnitDesc());
                unit.setProgram(updatedUnit.getProgram());
                return unitRepository.save(unit);
            })
            .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
    }

    @Override
    public void deleteUnit(String unitId) {
        unitRepository.deleteById(unitId);
    }

    @Override
    public void deleteUnits(List<String> unitIds) {
        unitRepository.deleteAllById(unitIds);
    }
}
