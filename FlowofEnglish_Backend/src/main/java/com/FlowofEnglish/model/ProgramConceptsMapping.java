package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Program_Subconcepts")
public class ProgramConceptsMapping {

    @Id
    @Column(name = "programconcept_id", length = 500)
    private String programConceptId;

    @Column(name = "program_concept_desc", length = 500, nullable = false)
    private String programConceptDesc;

    @ManyToOne
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private ContentMaster content;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "subconcept_id", nullable = false)
    private Subconcept subconcept;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;
    
    
	public ProgramConceptsMapping() {
	
	}
	


	public ProgramConceptsMapping(String programConceptId, String programConceptDesc, Concept concept,
			ContentMaster content, Unit unit, Program program, Subconcept subconcept, String uuid) {
		super();
		this.programConceptId = programConceptId;
		this.programConceptDesc = programConceptDesc;
		this.concept = concept;
		this.content = content;
		this.unit = unit;
		this.program = program;
		this.subconcept = subconcept;
		this.uuid = uuid;
	}



	public String getProgramConceptId() {
		return programConceptId;
	}



	public void setProgramConceptId(String programConceptId) {
		this.programConceptId = programConceptId;
	}



	public String getProgramConceptDesc() {
		return programConceptDesc;
	}



	public void setProgramConceptDesc(String programConceptDesc) {
		this.programConceptDesc = programConceptDesc;
	}



	public Concept getConcept() {
		return concept;
	}



	public void setConcept(Concept concept) {
		this.concept = concept;
	}



	public ContentMaster getContent() {
		return content;
	}



	public void setContent(ContentMaster content) {
		this.content = content;
	}



	public Unit getUnit() {
		return unit;
	}



	public void setUnit(Unit unit) {
		this.unit = unit;
	}



	public Program getProgram() {
		return program;
	}



	public void setProgram(Program program) {
		this.program = program;
	}



	public Subconcept getSubconcept() {
		return subconcept;
	}



	public void setSubconcept(Subconcept subconcept) {
		this.subconcept = subconcept;
	}



	public String getUuid() {
		return uuid;
	}



	public void setUuid(String uuid) {
		this.uuid = uuid;
	}



	@Override
	public String toString() {
		return "ProgramConceptsMapping [programConceptId=" + programConceptId + ", programConceptDesc="
				+ programConceptDesc + ", concept=" + concept + ", content=" + content + ", unit=" + unit + ", program="
				+ program + ", subconcept=" + subconcept + ", uuid=" + uuid + "]";
	}



	// Method to ensure UUID and generate programConceptId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
    
}
