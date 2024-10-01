package com.FlowofEnglish.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Subconcept")
public class Subconcept {

    @Id
    @Column(name = "subconcept_id", length = 255)
    private String subconceptId;

    @Column(name = "dependency", length = 1000)
    private String dependency;

    @Column(name = "show_to", length = 1000)
    private String showTo;

    @Column(name = "subconcept_desc", length = 255)
    private String subconceptDesc;
    
    @Column(name = "subconcept_desc 2", length = 255)
    private String subconceptDesc2;
    
    @Column(name = "subconcept_group", length = 1000)
    private String subconceptGroup;

    @Column(name = "subconcept_link", columnDefinition = "MEDIUMTEXT")
    private String subconceptLink;

    @Column(name = "subconcept_title", length = 1000)
    private String subconceptTitle;

    @Column(name = "subconcept_type", length = 1000)
    private String subconceptType;

    @Column(name = "user_type", length = 1000)
    private String userType;

    @Column(name = "uuid", length = 255, nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @ManyToOne
    @JoinColumn(name = "content_id")
    private ContentMaster content;

	public Subconcept() {
		
	}

	public Subconcept(String subconceptId, String dependency, String showTo, String subconceptDesc, String subconceptDesc2, 
			String subconceptGroup, String subconceptLink, String subconceptTitle, String subconceptType,
			String userType, String uuid, Concept concept, ContentMaster content) {
		super();
		this.subconceptId = subconceptId;
		this.dependency = dependency;
		this.showTo = showTo;
		this.subconceptDesc = subconceptDesc;
		this.subconceptDesc2 = subconceptDesc2;
		this.subconceptGroup = subconceptGroup;
		this.subconceptLink = subconceptLink;
		this.subconceptTitle = subconceptTitle;
		this.subconceptType = subconceptType;
		this.userType = userType;
		this.uuid = uuid;
		this.concept = concept;
		this.content = content;
	}

	// Getters and Setters
	public String getSubconceptId() {
		return subconceptId;
	}

	public void setSubconceptId(String subconceptId) {
		this.subconceptId = subconceptId;
	}

	public String getDependency() {
		return dependency;
	}

	public void setDependency(String dependency) {
		this.dependency = dependency;
	}

	public String getShowTo() {
		return showTo;
	}

	public void setShowTo(String showTo) {
		this.showTo = showTo;
	}

	public String getSubconceptDesc() {
		return subconceptDesc;
	}

	public void setSubconceptDesc(String subconceptDesc) {
		this.subconceptDesc = subconceptDesc;
	}

	public String getSubconceptDesc2() {
		return subconceptDesc2;
	}

	public void setSubconceptDesc2(String subconceptDesc2) {
		this.subconceptDesc2 = subconceptDesc2;
	}

	public String getSubconceptGroup() {
		return subconceptGroup;
	}

	public void setSubconceptGroup(String subconceptGroup) {
		this.subconceptGroup = subconceptGroup;
	}

	public String getSubconceptLink() {
		return subconceptLink;
	}

	public void setSubconceptLink(String subconceptLink) {
		this.subconceptLink = subconceptLink;
	}

	public String getSubconceptTitle() {
		return subconceptTitle;
	}

	public void setSubconceptTitle(String subconceptTitle) {
		this.subconceptTitle = subconceptTitle;
	}

	public String getSubconceptType() {
		return subconceptType;
	}

	public void setSubconceptType(String subconceptType) {
		this.subconceptType = subconceptType;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
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

	@Override
	public String toString() {
		return "Subconcept [subconceptId=" + subconceptId + ", dependency=" + dependency + ", showTo=" + showTo
				+ ", subconceptDesc=" + subconceptDesc + ", subconceptDesc2=" + subconceptDesc2 + ", subconceptGroup="
				+ subconceptGroup + ", subconceptLink=" + subconceptLink + ", subconceptTitle=" + subconceptTitle
				+ ", subconceptType=" + subconceptType + ", userType=" + userType + ", uuid=" + uuid + ", concept="
				+ concept + ", content=" + content + "]";
	}
	// Method to ensure UUID and generate subconceptId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
    
    
}
