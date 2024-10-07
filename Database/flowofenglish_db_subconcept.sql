-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: flowofenglish_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `subconcept`
--

DROP TABLE IF EXISTS `subconcept`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subconcept` (
  `subconcept_id` varchar(255) NOT NULL,
  `dependency` varchar(1000) DEFAULT NULL,
  `show_to` varchar(1000) DEFAULT NULL,
  `subconcept_desc` varchar(255) DEFAULT NULL,
  `subconcept_group` varchar(1000) DEFAULT NULL,
  `subconcept_link` mediumtext,
  `subconcept_title` varchar(1000) DEFAULT NULL,
  `subconcept_type` varchar(1000) DEFAULT NULL,
  `user_type` varchar(1000) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  `concept_id` varchar(255) DEFAULT NULL,
  `content_id` int DEFAULT NULL,
  `subconcept_desc 2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`subconcept_id`),
  UNIQUE KEY `UKebrxic4r9u6rt35djcb0piewr` (`uuid`),
  KEY `FKnvifrbdywkvf0ypv4qvu1qw6e` (`concept_id`),
  KEY `FK87k7vq03ydssjhqli9xjg5i1r` (`content_id`),
  CONSTRAINT `FK87k7vq03ydssjhqli9xjg5i1r` FOREIGN KEY (`content_id`) REFERENCES `content` (`content_id`),
  CONSTRAINT `FKnvifrbdywkvf0ypv4qvu1qw6e` FOREIGN KEY (`concept_id`) REFERENCES `concepts` (`concept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subconcept`
--

LOCK TABLES `subconcept` WRITE;
/*!40000 ALTER TABLE `subconcept` DISABLE KEYS */;
INSERT INTO `subconcept` VALUES ('S1007',NULL,NULL,'Read and respond - L1 -  Bee','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/bee.html','Bee','software',NULL,'44a58a2c-23d0-43c9-abb6-53d838d1cce2','C126',2002,NULL),('S1008','AIF - 6, EEA - 3','Public','Read and respond - L1 - Hide and Seek','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/hideAndSeek.html','Hide and Seek','Literal','Student','6b641c18-6000-460f-b181-a205f7c22d90','C126',2002,NULL),('S1009','AIF - 6, EEA - 3','Public','Read and respond - L1 - Sea Turtles','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/seaTurtles.html','Sea Turtles','Literal','Student','762a0cd0-ab98-42c4-91f8-15c22d3fa9aa','C126',2002,NULL),('S1010','AIF - 6, EEA - 3','Public','Read and respond - L1 - Goats','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/goats.html','Goats','Literal','Student','4ecaee52-8d28-4b86-adc9-664cae223cab','C126',2002,NULL),('S1011','AIF - 6, EEA - 3','Public','Read and respond - L1 - Playtime','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/playTime.html','Playtime','Literal','Student','a5c5431d-46e6-465d-9727-2983fa59dc0b','C126',2002,NULL),('S1012','AIF - 6, EEA - 3','Public','Read and respond - L1 - Deer','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/deer.html','Deer','Literal','Student','b4f0d480-734f-4e36-a43c-e62a1906cb1b','C126',2002,NULL),('S1013','AIF - 6, EEA - 3','Public','Read and respond - L1 - Stars','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/stars.html','Stars','Literal','Student','4ecbc1c2-bc1b-4ca1-aab0-f0a2e68a3fe9','C126',2002,NULL),('S1014','AIF - 6, EEA - 3','Public','Read and respond - L1 - Cat\'s Tongue','Literal','https://chippersageblr.s3.ap-south-1.amazonaws.com/Learner-v4/Sentences/readAndRespond/stage1/catsTongue.html','Cat\'s Tongue','Literal','Student','578cb6c4-e2ad-4964-8d39-29aee07f88aa','C126',2002,NULL);
/*!40000 ALTER TABLE `subconcept` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:02
