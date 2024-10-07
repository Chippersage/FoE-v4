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
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `unit_id` varchar(500) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  `unit_desc` varchar(1000) DEFAULT NULL,
  `unit_name` varchar(255) NOT NULL,
  `stage_id` varchar(255) NOT NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `UK9ig45h2iii942ho16uy32k7pi` (`uuid`),
  KEY `FKgaew4wsrusx88m7ol6fc8886e` (`program_id`),
  KEY `FK7rcwia9yg2b5siovn1ttikrb9` (`stage_id`),
  CONSTRAINT `FK7rcwia9yg2b5siovn1ttikrb9` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`),
  CONSTRAINT `FKgaew4wsrusx88m7ol6fc8886e` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
INSERT INTO `unit` VALUES ('Unit_EEA_Read_0','0a6db6fe-67bc-454b-923d-c74c3b46f7c2','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 0','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_1','d4fd5a80-74ac-44b5-a3d0-93bc41c23279','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 1','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_10','218ef631-445d-435a-94cc-143067c97735','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 10','Prg_EEA_1_Stg_1'),('Unit_EEA_Read_11','43176f4b-69bb-4bcc-9f5a-7426d795b61d','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 11','Prg_EEA_1_Stg_1'),('Unit_EEA_Read_2','d1648268-f552-440f-80db-fd8f6c9280a5','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 2','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_3','35a7f2c8-0e93-4524-a1d8-fb98cbc99ce7','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 3','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_4','192b4120-76b2-4935-be3d-322190ec0128','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 4','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_5','e21c90a2-d2fd-4a34-9731-65dfa766763e','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 5','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_6','15edefe3-b1aa-4d30-b3e7-8eecbdc5d154','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 6','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_7','48348345-1e88-4689-8970-81e73095e6c1','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 7','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_8','2fdef9ed-1cb5-4743-8022-74d0c90cb8ce','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 8','Prg_EEA_1_Stg_0'),('Unit_EEA_Read_9','5e59720c-b16b-44ec-bfdb-efed6b396f7a','EEA - 3','In this unit, you should read the lines and answer the questions that follow','Read and Respond 9','Prg_EEA_1_Stg_0');
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:09
