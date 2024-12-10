package com.FlowofEnglish.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.FlowofEnglish.util.RandomStringUtil;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "organizations", uniqueConstraints = @UniqueConstraint(columnNames = "organization_admin_email"))
public class Organization {

    @Id
    @Column(name = "organization_id", nullable = false)
    private String organizationId;

    @Column(name = "organization_name", nullable = false, length = 100)
    private String organizationName;

    @Column(name = "organization_admin_name", nullable = false, length = 100)
    private String organizationAdminName;

    @Column(name = "organization_admin_email", nullable = false, length = 100)
    private String organizationAdminEmail;

    @Column(name = "organization_admin_phone", length = 15, nullable = false)
    private String organizationAdminPhone;

    @Column(name = "org_password", nullable = false)
    private String orgPassword;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime deletedAt;

    @Column(name = "uuid", unique = true, nullable = false, updatable = false)
    private String uuid;

    // Default constructor
    public Organization() {
    }

    // Parameterized constructor
    public Organization(String organizationId, String organizationName, String organizationAdminName,
                        String organizationAdminEmail, String organizationAdminPhone, String orgPassword,
                        OffsetDateTime createdAt, OffsetDateTime updatedAt, OffsetDateTime deletedAt, String uuid) {
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.organizationAdminName = organizationAdminName;
        this.organizationAdminEmail = organizationAdminEmail;
        this.organizationAdminPhone = organizationAdminPhone;
        this.orgPassword = orgPassword;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.uuid = uuid;
    }

    // Getters and Setters
 
    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationAdminName() {
        return organizationAdminName;
    }

    public void setOrganizationAdminName(String organizationAdminName) {
        this.organizationAdminName = organizationAdminName;
    }

    public String getOrganizationAdminEmail() {
        return organizationAdminEmail;
    }

    public void setOrganizationAdminEmail(String organizationAdminEmail) {
        this.organizationAdminEmail = organizationAdminEmail;
    }

    public String getOrganizationAdminPhone() {
        return organizationAdminPhone;
    }

    public void setOrganizationAdminPhone(String organizationAdminPhone) {
        this.organizationAdminPhone = organizationAdminPhone;
    }

    public String getOrgPassword() {
        return orgPassword;
    }

    public void setOrgPassword(String orgPassword) {
        this.orgPassword = orgPassword;
    }

    public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public OffsetDateTime getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(OffsetDateTime deletedAt) {
		this.deletedAt = deletedAt;
	}

	public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @Override
    public String toString() {
        return "Organization [organizationId=" + organizationId + ", organizationName=" + organizationName
                + ", organizationAdminName=" + organizationAdminName + ", organizationAdminEmail="
                + organizationAdminEmail + ", organizationAdminPhone=" + organizationAdminPhone + ", orgPassword="
                + orgPassword + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt + ", deletedAt=" + deletedAt
                + ", uuid=" + uuid + "]";
    }

     // Method to ensure UUID and generate organizationId before persisting
    @PrePersist
    private void ensureUuidAndIds() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }

     // Generate organizationId based on organizationName
        if (this.organizationId == null || this.organizationId.isEmpty()) {
            if (this.organizationName != null && !this.organizationName.isEmpty()) {
                // Remove spaces from the organizationName
                String nameWithoutSpaces = this.organizationName.replaceAll("\\s+", "");
                // Take the first 4 characters of organizationName, if available
                this.organizationId = nameWithoutSpaces.length() >= 4
                        ? nameWithoutSpaces.substring(0, 4).toUpperCase() // Convert to uppercase for consistency
                        : String.format("%-4s", nameWithoutSpaces).replace(' ', 'X').toUpperCase(); // Pad if less than 4 chars
            } else {
                // Fallback to random ID if organizationName is null or empty
                this.organizationId = RandomStringUtil.generateRandomAlphabetic(4).toUpperCase();
            }
        }
    }

}
