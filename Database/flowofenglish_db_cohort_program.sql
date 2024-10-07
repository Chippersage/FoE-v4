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
-- Table structure for table `cohort_program`
--

DROP TABLE IF EXISTS `cohort_program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cohort_program` (
  `cohort_program_id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `cohort_id` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  PRIMARY KEY (`cohort_program_id`),
  UNIQUE KEY `UK1wx29lwtncb7o9y319r88laun` (`uuid`),
  KEY `FK2mu7xd41gv72w6wy0pemagjew` (`cohort_id`),
  KEY `FK5k0uvvckv163orphc2o50r4f0` (`program_id`),
  CONSTRAINT `FK2mu7xd41gv72w6wy0pemagjew` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`cohort_id`),
  CONSTRAINT `FK5k0uvvckv163orphc2o50r4f0` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cohort_program`
--

LOCK TABLES `cohort_program` WRITE;
/*!40000 ALTER TABLE `cohort_program` DISABLE KEYS */;
INSERT INTO `cohort_program` VALUES (1,'8c671748-5ca3-4f5f-9662-3f5c060f20a4','Cht_Sep-24-Bhive','EEA - 3');
/*!40000 ALTER TABLE `cohort_program` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:05
