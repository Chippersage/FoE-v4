package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ContentMaster;
import com.FlowofEnglish.repository.ContentMasterRepository;
import com.opencsv.CSVReader;
import jakarta.transaction.Transactional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContentMasterServiceImpl implements ContentMasterService {

    @Autowired
    private ContentMasterRepository contentMasterRepository;

    @Override
    public List<ContentMaster> getAllContents() {
        return contentMasterRepository.findAll();
    }

    @Override
    public Optional<ContentMaster> getContentById(int id) {
        return contentMasterRepository.findById(id);
    }

    @Override
    public ContentMaster createContent(ContentMaster content) {
        content.setUuid(UUID.randomUUID().toString()); // Ensure UUID generation
        return contentMasterRepository.save(content);
    }
    @Override
    @Transactional
    public Map<String, Object> uploadContents(MultipartFile file) throws Exception {
        List<String> insertedIds = new ArrayList<>();
        List<String> duplicateIdsInCsv = new ArrayList<>();
        List<String> duplicateIdsInDatabase = new ArrayList<>();
        List<String> errorIds = new ArrayList<>();
        Set<Integer> seenIds = new HashSet<>(); // To track duplicate IDs in the CSV file itself

        List<ContentMaster> contentMasters = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            
            while ((line = reader.readNext()) != null) {
                try {
                    int contentId = Integer.parseInt(line[0]);
                    
                    // Skip if contentId is duplicate in CSV file itself
                    if (seenIds.contains(contentId)) {
                        duplicateIdsInCsv.add(String.valueOf(contentId));
                        continue;
                    }
                    seenIds.add(contentId);
                    
                    // Check if contentId already exists in the database
                    if (contentMasterRepository.existsById(contentId)) {
                        duplicateIdsInDatabase.add(String.valueOf(contentId));
                        continue;
                    }

                    // Create ContentMaster object
                    ContentMaster content = new ContentMaster();
                    content.setContentId(contentId);
                    content.setContentName(line[1]);
                    content.setContentDesc(line[2]);
                    content.setContentOrigin(line[3]);
                    content.setContentTopic(line[4]);
                    content.setUuid(UUID.randomUUID().toString());
                    contentMasters.add(content);

                } catch (Exception e) {
                    errorIds.add(line[0]); // Add to error list if there's an issue parsing or creating the object
                }
            }
        }

        // Insert valid records into the database
        try {
            List<ContentMaster> savedContents = contentMasterRepository.saveAll(contentMasters);
            insertedIds = savedContents.stream().map(c -> String.valueOf(c.getContentId())).collect(Collectors.toList());
        } catch (DataIntegrityViolationException e) {
            // Handle DB constraint violations if they occur
            errorIds.add("Database constraint violation occurred");
        }

        // Prepare response data
        Map<String, Object> response = new HashMap<>();
        response.put("insertedIds", insertedIds);
        response.put("duplicateIdsInCsv", duplicateIdsInCsv);
        response.put("duplicateIdsInDatabase", duplicateIdsInDatabase);
        response.put("errorIds", errorIds);
        response.put("successfulInsertCount", insertedIds.size());
        response.put("failedInsertCount", duplicateIdsInCsv.size() + duplicateIdsInDatabase.size() + errorIds.size());

        return response;
    }
    
   

    @Override
    public ContentMaster updateContent(int id, ContentMaster updatedContent) {
        Optional<ContentMaster> existingContent = contentMasterRepository.findById(id);
        if (existingContent.isPresent()) {
            ContentMaster content = existingContent.get();
            content.setContentName(updatedContent.getContentName());
            content.setContentDesc(updatedContent.getContentDesc());
            content.setContentOrigin(updatedContent.getContentOrigin());
            content.setContentTopic(updatedContent.getContentTopic());
            return contentMasterRepository.save(content);
        }
        return null;
    }

    @Override
    public void deleteContent(int id) {
        contentMasterRepository.deleteById(id);
    }
}
