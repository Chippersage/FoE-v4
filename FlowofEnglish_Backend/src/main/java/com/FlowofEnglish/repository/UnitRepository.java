package com.FlowofEnglish.repository;

import com.FlowofEnglish.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {

    // Custom query to get all units by Program ID
    List<Unit> findByProgramProgramId(String programId);
}
