package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Unit")
public class Unit {

    @Id
    @Column(name = "unit_id", length = 500)
    private String unitId;

    @Column(name = "learning_desc", length = 1000)
    private String learningDesc;

    @Column(name = "lesson_name", length = 255, nullable = false)
    private String lessonName;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    
	public Unit() {
		
	}


	public Unit(String unitId, String learningDesc, String lessonName, String uuid, Program program) {
		super();
		this.unitId = unitId;
		this.learningDesc = learningDesc;
		this.lessonName = lessonName;
		this.uuid = uuid;
		this.program = program;
	}

	// Getters and Setters
	public String getUnitId() {
		return unitId;
	}


	public void setUnitId(String unitId) {
		this.unitId = unitId;
	}


	public String getLearningDesc() {
		return learningDesc;
	}


	public void setLearningDesc(String learningDesc) {
		this.learningDesc = learningDesc;
	}


	public String getLessonName() {
		return lessonName;
	}


	public void setLessonName(String lessonName) {
		this.lessonName = lessonName;
	}


	public String getUuid() {
		return uuid;
	}


	public void setUuid(String uuid) {
		this.uuid = uuid;
	}


	public Program getProgram() {
		return program;
	}


	public void setProgram(Program program) {
		this.program = program;
	}


	@Override
	public String toString() {
		return "Unit [unitId=" + unitId + ", learningDesc=" + learningDesc + ", lessonName=" + lessonName + ", uuid="
				+ uuid + ", program=" + program + "]";
	}


	// Method to ensure UUID and generate unitId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
    
}
