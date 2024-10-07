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
-- Table structure for table `program_subconcepts`
--

DROP TABLE IF EXISTS `program_subconcepts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_subconcepts` (
  `programconcept_id` varchar(500) NOT NULL,
  `program_concept_desc` varchar(500) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  `stage_id` varchar(255) NOT NULL,
  `subconcept_id` varchar(255) NOT NULL,
  `unit_id` varchar(500) NOT NULL,
  PRIMARY KEY (`programconcept_id`),
  UNIQUE KEY `UKlucq0guw8829h9llaw3malijr` (`uuid`),
  KEY `FK5qf1r6fdfl88v62put3mbduw6` (`program_id`),
  KEY `FKn33qxmhtkyf4ei238fx6a8ugb` (`stage_id`),
  KEY `FKk05b5vlef2rw4d3xqouows160` (`subconcept_id`),
  KEY `FK9pcmqkvyy9eo0o3vb23mubnbo` (`unit_id`),
  CONSTRAINT `FK5qf1r6fdfl88v62put3mbduw6` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  CONSTRAINT `FK9pcmqkvyy9eo0o3vb23mubnbo` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`),
  CONSTRAINT `FKk05b5vlef2rw4d3xqouows160` FOREIGN KEY (`subconcept_id`) REFERENCES `subconcept` (`subconcept_id`),
  CONSTRAINT `FKn33qxmhtkyf4ei238fx6a8ugb` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_subconcepts`
--

LOCK TABLES `program_subconcepts` WRITE;
/*!40000 ALTER TABLE `program_subconcepts` DISABLE KEYS */;
INSERT INTO `program_subconcepts` VALUES ('a6d1b3ec-7b29-11ef-904d-10653073d461','Read and respond activity - Bee','a6d1b453-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0'),('a6d440b9-7b29-11ef-904d-10653073d461','Read and respond activity - Hide and Seek','a6d44102-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1008','Unit_EEA_Read_0'),('a6d44e66-7b29-11ef-904d-10653073d461','Read and respond activity - Sea Turtles','a6d44eb2-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1009','Unit_EEA_Read_0'),('a6d45882-7b29-11ef-904d-10653073d461','Read and respond activity - Goats','a6d458b1-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1010','Unit_EEA_Read_0'),('a6d476f0-7b29-11ef-904d-10653073d461','Read and respond activity - Playtime','a6d47716-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1011','Unit_EEA_Read_0'),('a6d47cce-7b29-11ef-904d-10653073d461','Read and respond activity - Deer','a6d47ce9-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1012','Unit_EEA_Read_0'),('a6d48386-7b29-11ef-904d-10653073d461','Read and respond activity - Stars','a6d483a1-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1013','Unit_EEA_Read_0'),('a6d4c523-7b29-11ef-904d-10653073d461','Read and respond activity - Cat\'s Tongue','a6d4c55a-7b29-11ef-904d-10653073d461','EEA - 3','Prg_EEA_1_Stg_0','S1014','Unit_EEA_Read_0');
/*!40000 ALTER TABLE `program_subconcepts` ENABLE KEYS */;
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
