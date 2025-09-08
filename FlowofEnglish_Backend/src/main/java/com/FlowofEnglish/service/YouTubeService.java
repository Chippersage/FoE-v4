//package com.FlowofEnglish.service;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//import java.net.HttpURLConnection;
//import java.net.URL;
//import java.util.stream.Collectors;
//
//import org.springframework.stereotype.Service;
//import com.jayway.jsonpath.JsonPath;
//
//@Service
//public class YouTubeService {
//
//    private final String apiKey = "YOUR_API_KEY";
//
//    public int getVideoDurationInSeconds(String embedUrl) {
//        try {
//            String videoId = extractVideoId(embedUrl);
//            URL url = new URL("https://www.googleapis.com/youtube/v3/videos?id=" 
//                               + videoId + "&part=contentDetails&key=" + apiKey);
//            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//            conn.setRequestMethod("GET");
//            
//            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
//                String response = reader.lines().collect(Collectors.joining());
//                // parse ISO8601 duration (PT#M#S)
//                String isoDuration = JsonPath.read(response, "$.items[0].contentDetails.duration");
//                return parseISO8601Duration(isoDuration);
//            }
//        } catch (Exception e) {
//            return 0;
//        }
//    }
//
//    private String extractVideoId(String embedUrl) {
//        // Handle "youtube.com/embed/..." style
//        if (embedUrl.contains("embed/")) {
//            return embedUrl.substring(embedUrl.indexOf("embed/") + 6).split("[?&]")[0];
//        }
//        return embedUrl;
//    }
//
//    private int parseISO8601Duration(String duration) {
//        return (int) java.time.Duration.parse(duration).getSeconds();
//    }
//}
