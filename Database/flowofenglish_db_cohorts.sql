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
-- Table structure for table `cohorts`
--

DROP TABLE IF EXISTS `cohorts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cohorts` (
  `cohort_id` varchar(255) NOT NULL,
  `cohort_creation` datetime(6) NOT NULL,
  `cohort_end_date` date NOT NULL,
  `cohort_start_date` date NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `organization_id` varchar(255) NOT NULL,
  `cohort_name` varchar(100) NOT NULL,
  PRIMARY KEY (`cohort_id`),
  UNIQUE KEY `UK231ynup8xb56cqrwpnhwh4lme` (`uuid`),
  KEY `FK8u4fkcv3p58ef6ulyat1visnl` (`organization_id`),
  CONSTRAINT `FK8u4fkcv3p58ef6ulyat1visnl` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cohorts`
--

LOCK TABLES `cohorts` WRITE;
/*!40000 ALTER TABLE `cohorts` DISABLE KEYS */;
INSERT INTO `cohorts` VALUES ('Cht_Sep-24-Bhive','2024-09-19 14:47:37.000000','2024-10-19','2024-09-19','8f5a12ce-075b-4086-84d9-18b320ec990f','Chipper','Sep-24-Bhive');
/*!40000 ALTER TABLE `cohorts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:07
