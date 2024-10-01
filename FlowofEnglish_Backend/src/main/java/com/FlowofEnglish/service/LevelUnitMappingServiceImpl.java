//package com.FlowofEnglish.service;
//
//
//import com.FlowofEnglish.model.LevelUnitMapping;
//import com.FlowofEnglish.repository.LevelUnitMappingRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class LevelUnitMappingServiceImpl implements LevelUnitMappingService {
//
//    @Autowired
//    private LevelUnitMappingRepository levelUnitMappingRepository;
//
//    @Override
//    public List<LevelUnitMapping> getAllLevelUnitMappings() {
//        return levelUnitMappingRepository.findAll();
//    }
//
//    @Override
//    public Optional<LevelUnitMapping> getLevelUnitMappingById(String levelId) {
//        return levelUnitMappingRepository.findById(levelId);
//    }
//
//    @Override
//    public LevelUnitMapping createLevelUnitMapping(LevelUnitMapping levelUnitMapping) {
//        return levelUnitMappingRepository.save(levelUnitMapping);
//    }
//
//    @Override
//    public LevelUnitMapping updateLevelUnitMapping(String levelId, LevelUnitMapping levelUnitMapping) {
//        return levelUnitMappingRepository.findById(levelId).map(existingMapping -> {
//            existingMapping.setUnit(levelUnitMapping.getUnit());
//            existingMapping.setProgram(levelUnitMapping.getProgram());
//            return levelUnitMappingRepository.save(existingMapping);
//        }).orElseThrow(() -> new RuntimeException("LevelUnitMapping not found"));
//    }
//
//    @Override
//    public void deleteLevelUnitMapping(String levelId) {
//        levelUnitMappingRepository.deleteById(levelId);
//    }
//}
