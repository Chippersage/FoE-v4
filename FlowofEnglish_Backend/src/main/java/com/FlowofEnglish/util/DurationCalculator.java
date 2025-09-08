//package com.FlowofEnglish.util;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import com.FlowofEnglish.model.*;
//import com.FlowofEnglish.service.*;
//
//@Component
//public class DurationCalculator {
//
//    private final S3MediaService s3MediaService;
//    private final YouTubeService youTubeService;
//
//    @Autowired
//    public DurationCalculator(S3MediaService s3MediaService, YouTubeService youTubeService) {
//        this.s3MediaService = s3MediaService;
//        this.youTubeService = youTubeService;
//    }
//
//    public int calculateDuration(Subconcept subconcept) {
//        String type = subconcept.getSubconceptType().toLowerCase();
//        String link = subconcept.getSubconceptLink();
//        Integer numQuestions = subconcept.getNumQuestions();
//
//        switch (type) {
//            case "video":
//            case "audio":
//                return s3MediaService.getMediaDurationInSeconds(link);
//
//            case "youtube":
//                return youTubeService.getVideoDurationInSeconds(link);
//
//            case "image":
//                return 2 * 60;
//
//            case "pdf":
//                return 5 * 60;
//
//            case "passage_read":
//                return (numQuestions == null || numQuestions == 0) ? (6 * 60) : numQuestions * 60;
//
//            default:
//                // fallback to questions × 1 min
//                return (numQuestions != null && numQuestions > 0) ? numQuestions * 60 : 0;
//        }
//    }
//}
//
