//package com.FlowofEnglish.service;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//
//import org.springframework.stereotype.Service;
//
//@Service
//public class S3MediaService {
//
//    public int getMediaDurationInSeconds(String s3Url) {
//        try {
//            // Download metadata only, not full file
//            ProcessBuilder pb = new ProcessBuilder(
//                "ffprobe", "-v", "error", "-show_entries",
//                "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", s3Url
//            );
//            Process process = pb.start();
//            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
//            String durationStr = reader.readLine();
//            if (durationStr != null) {
//                return (int) Math.round(Double.parseDouble(durationStr));
//            }
//        } catch (Exception e) {
//            return 0; // fallback
//        }
//        return 0;
//    }
//}
