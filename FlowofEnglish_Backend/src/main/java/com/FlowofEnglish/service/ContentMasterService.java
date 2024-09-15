package com.FlowofEnglish.service;

import com.FlowofEnglish.model.ContentMaster;
import java.util.List;
import java.util.Optional;

public interface ContentMasterService {
    List<ContentMaster> getAllContents();
    Optional<ContentMaster> getContentById(int id);
    ContentMaster createContent(ContentMaster content);
    ContentMaster updateContent(int id, ContentMaster content);
    void deleteContent(int id);
}
