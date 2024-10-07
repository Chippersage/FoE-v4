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
-- Table structure for table `stage`
--

DROP TABLE IF EXISTS `stage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stage` (
  `stage_id` varchar(255) NOT NULL,
  `stage_desc` varchar(255) DEFAULT NULL,
  `stage_name` varchar(255) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  PRIMARY KEY (`stage_id`),
  UNIQUE KEY `UKdww6nkiludl40pr4xqi8ie2qp` (`uuid`),
  KEY `FK36yc6j06dtyto0b2mxxi3pt1l` (`program_id`),
  CONSTRAINT `FK36yc6j06dtyto0b2mxxi3pt1l` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage`
--

LOCK TABLES `stage` WRITE;
/*!40000 ALTER TABLE `stage` DISABLE KEYS */;
INSERT INTO `stage` VALUES ('Prg_EEA_1_Stg_0','Basic info','Stage 0','40ef4387-915b-423a-9d9e-e88fb77f8eb9','EEA - 3'),('Prg_EEA_1_Stg_1','Basic info','Stage 1','db11df14-aefc-4acf-8891-39882cf938ae','EEA - 3'),('Prg_EEA_1_Stg_2','Basic info','Stage 2','aab3285e-8c60-4578-9a72-1e973156ef0d','EEA - 3'),('Prg_EEA_1_Stg_3','Basic info','Stage 3','4f3380d5-5f75-40f9-b58b-cd257ba9af3c','EEA - 3'),('Prg_EEA_1_Stg_4','Basic info','Stage 4','32695cf6-62f0-4c60-9c53-ff748c557c89','EEA - 3'),('Prg_EEA_1_Stg_5','Basic info','Stage 5','fa4b97af-975c-4495-9c44-8431f14fee32','EEA - 3');
/*!40000 ALTER TABLE `stage` ENABLE KEYS */;
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
