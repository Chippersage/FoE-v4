// S3StorageService.java
package com.FlowofEnglish.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.ResponseInputStream;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class S3StorageService {
    private static final String BUCKET_NAME = "your-s3-bucket-name";
    
    @Autowired
    private S3Client s3Client;

    public String uploadFile(MultipartFile file, String directory) throws IOException {
        String fileKey = generateS3Key(file.getOriginalFilename(), directory);
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(BUCKET_NAME)
            .key(fileKey)
            .contentType(file.getContentType())
            .build();

        s3Client.putObject(putObjectRequest, 
            RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        
        return fileKey;
    }

    public ResponseInputStream<GetObjectResponse> downloadFile(String fileKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(BUCKET_NAME)
            .key(fileKey)
            .build();
            
        return s3Client.getObject(getObjectRequest);
    }

    private String generateS3Key(String originalFilename, String directory) {
        return directory + "/" + 
               LocalDate.now() + "/" + 
               UUID.randomUUID() + "_" + 
               originalFilename;
    }
}

