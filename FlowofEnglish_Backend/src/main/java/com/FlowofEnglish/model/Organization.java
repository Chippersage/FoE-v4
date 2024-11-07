package com.FlowofEnglish.model;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.FlowofEnglish.util.RandomStringUtil;

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

    @Column(name = "organization_admin_phone", length = 15)
    private String organizationAdminPhone;

    @Column(name = "org_password", nullable = false)
    private String orgpassword;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "uuid", unique = true, nullable = false, updatable = false)
    private String uuid;

    // Default constructor
    public Organization() {
    }

    // Parameterized constructor
    public Organization(String organizationId, String organizationName, String organizationAdminName,
                        String organizationAdminEmail, String organizationAdminPhone, String orgpassword,
                        LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt, String uuid) {
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.organizationAdminName = organizationAdminName;
        this.organizationAdminEmail = organizationAdminEmail;
        this.organizationAdminPhone = organizationAdminPhone;
        this.orgpassword = orgpassword;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.uuid = uuid;
    }

    // Getters and Setters
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

    public String getOrgpassword() {
        return orgpassword;
    }

    public void setOrgpassword(String orgpassword) {
        this.orgpassword = orgpassword;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt.atZone(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt.atZone(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt != null ? deletedAt.atZone(ZoneId.of("Asia/Kolkata")).toLocalDateTime() : null;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
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
                + organizationAdminEmail + ", organizationAdminPhone=" + organizationAdminPhone + ", orgpassword="
                + orgpassword + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt + ", deletedAt=" + deletedAt
                + ", uuid=" + uuid + "]";
    }

     // Method to ensure UUID and generate organizationId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }

        // Generate organizationId based on organizationName
        if (this.organizationId == null || this.organizationId.isEmpty()) {
            if (this.organizationName != null && !this.organizationName.isEmpty()) {
                // Take the first 4 characters of organizationName, if available
                this.organizationId = this.organizationName.length() >= 4
                        ? this.organizationName.substring(0, 4).toUpperCase() // Convert to uppercase for consistency
                        : String.format("%-4s", this.organizationName).replace(' ', 'X').toUpperCase(); // Pad if less than 4 chars
            } else {
                // Fallback to random ID if organizationName is null or empty
                this.organizationId = RandomStringUtil.generateRandomAlphabetic(4).toUpperCase();
            }
        }
    }

}
