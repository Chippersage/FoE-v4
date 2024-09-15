package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ContentMaster;
import com.FlowofEnglish.repository.ContentMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    public ContentMaster updateContent(int id, ContentMaster updatedContent) {
        Optional<ContentMaster> existingContent = contentMasterRepository.findById(id);
        if (existingContent.isPresent()) {
            ContentMaster content = existingContent.get();
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
