package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Concepts")
public class Concept {

    @Id
    @Column(name = "concept_id", length = 255)
    private String conceptId;
    
    @Column(name = "concept_name", length = 50, nullable = false)
    private String conceptName;


	@Column(name = "concept_desc", length = 50, nullable = false)
    private String conceptDesc;

    @Column(name = "concept_skill_1", length = 50, nullable = false)
    private String conceptSkill1;

    @Column(name = "concept_skill_2", length = 50, nullable = false)
    private String conceptSkill2;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private ContentMaster content;

	public Concept() {
	}
	
	public Concept(String conceptId, String conceptName, String conceptDesc, String conceptSkill1, String conceptSkill2, String uuid,
			ContentMaster content) {
		super();
		this.conceptId = conceptId;
		this.conceptName = conceptName;
		this.conceptDesc = conceptDesc;
		this.conceptSkill1 = conceptSkill1;
		this.conceptSkill2 = conceptSkill2;
		this.uuid = uuid;
		this.content = content;
	}





	

	public String getConceptId() {
		return conceptId;
	}

	public void setConceptId(String conceptId) {
		this.conceptId = conceptId;
	}
	
	public String getConceptName() {
		return conceptName;
	}

	public void setConceptName(String conceptName) {
		this.conceptName = conceptName;
	}

	public String getConceptDesc() {
		return conceptDesc;
	}

	public void setConceptDesc(String conceptDesc) {
		this.conceptDesc = conceptDesc;
	}

	public String getConceptSkill1() {
		return conceptSkill1;
	}

	public void setConceptSkill1(String conceptSkill1) {
		this.conceptSkill1 = conceptSkill1;
	}

	public String getConceptSkill2() {
		return conceptSkill2;
	}

	public void setConceptSkill2(String conceptSkill2) {
		this.conceptSkill2 = conceptSkill2;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public ContentMaster getContent() {
		return content;
	}

	public void setContent(ContentMaster content) {
		this.content = content;
	}

	@Override
	public String toString() {
		return "Concept [conceptId=" + conceptId + ", conceptName=" + conceptName + ", conceptDesc=" + conceptDesc
				+ ", conceptSkill1=" + conceptSkill1 + ", conceptSkill2=" + conceptSkill2 + ", uuid=" + uuid
				+ ", content=" + content + "]";
	}

	// Method to ensure UUID and generate conceptId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }

    }
}
