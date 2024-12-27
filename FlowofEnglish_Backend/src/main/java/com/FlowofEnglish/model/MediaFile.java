package com.FlowofEnglish.model;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "MediaFiles")
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime uploadedAt;

    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    
    // Getters, Setters, Constructors
  
	public MediaFile() {
		}

	
	public MediaFile(Long fileId, String fileName, String fileType, Long fileSize, String filePath,
			OffsetDateTime uploadedAt, String uuid) {
		super();
		this.fileId = fileId;
		this.fileName = fileName;
		this.fileType = fileType;
		this.fileSize = fileSize;
		this.filePath = filePath;
		this.uploadedAt = uploadedAt;
		this.uuid = uuid;
	}


	public Long getFileId() {
		return fileId;
	}

	public void setFileId(Long fileId) {
		this.fileId = fileId;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public Long getFileSize() {
		return fileSize;
	}

	public void setFileSize(Long fileSize) {
		this.fileSize = fileSize;
	}

	public String getFilePath() {
		return filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	public OffsetDateTime getUploadedAt() {
		return uploadedAt;
	}

	public void setUploadedAt(OffsetDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
    
	 @Override
	public String toString() {
		return "MediaFile [fileId=" + fileId + ", fileName=" + fileName + ", fileType=" + fileType + ", fileSize="
				+ fileSize + ", filePath=" + filePath + ", uploadedAt=" + uploadedAt + ", uuid=" + uuid + "]";
	}

		// Method to ensure UUID and generate fileId before persisting
	    @PrePersist
	    private void ensureUuid() {
	        if (this.uuid == null) {
	            this.uuid = UUID.randomUUID().toString();
	        }
	    }

}

