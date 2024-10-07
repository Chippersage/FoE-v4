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
-- Table structure for table `user_sub_concept_completion`
--

DROP TABLE IF EXISTS `user_sub_concept_completion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sub_concept_completion` (
  `user_subconcept_id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  `stage_id` varchar(255) NOT NULL,
  `subconcept_id` varchar(255) NOT NULL,
  `unit_id` varchar(500) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`user_subconcept_id`),
  UNIQUE KEY `UKgcj96qf5oblug349e42t39pkv` (`uuid`),
  KEY `FK1hxq9s16nvfsftdukxa7ad9x4` (`program_id`),
  KEY `FKgx7cnjb0ouel2pavcvoy5q0sm` (`stage_id`),
  KEY `FKr1lg2s2m0xvjaimgrmhygi6oc` (`subconcept_id`),
  KEY `FKnqhvyynrow5q71kbgvteh275o` (`unit_id`),
  KEY `FK65uqvure23gp0l88rjaue51v2` (`user_id`),
  CONSTRAINT `FK1hxq9s16nvfsftdukxa7ad9x4` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  CONSTRAINT `FK65uqvure23gp0l88rjaue51v2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `FKgx7cnjb0ouel2pavcvoy5q0sm` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`),
  CONSTRAINT `FKnqhvyynrow5q71kbgvteh275o` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`),
  CONSTRAINT `FKr1lg2s2m0xvjaimgrmhygi6oc` FOREIGN KEY (`subconcept_id`) REFERENCES `subconcept` (`subconcept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sub_concept_completion`
--

LOCK TABLES `user_sub_concept_completion` WRITE;
/*!40000 ALTER TABLE `user_sub_concept_completion` DISABLE KEYS */;
INSERT INTO `user_sub_concept_completion` VALUES (1,'054ba17a-31b4-416e-83b5-68f8718e9464','EEA - 3','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(2,'a11b4fa9-b097-409d-ac2c-973e1551170a','EEA - 3','Prg_EEA_1_Stg_0','S1008','Unit_EEA_Read_0','user1@chippersage.com'),(3,'f5c75a6c-4e73-4814-9cae-3606616fa537','EEA - 3','Prg_EEA_1_Stg_0','S1009','Unit_EEA_Read_0','user1@chippersage.com'),(4,'13a55209-0ff7-4331-a532-e320edce4e04','EEA - 3','Prg_EEA_1_Stg_0','S1010','Unit_EEA_Read_0','user1@chippersage.com'),(5,'bc29c627-fb72-457e-8892-0cde42e46a7e','EEA - 3','Prg_EEA_1_Stg_0','S1011','Unit_EEA_Read_0','user1@chippersage.com'),(6,'25728d67-b83b-43f2-92e0-0ff83117b955','EEA - 3','Prg_EEA_1_Stg_0','S1012','Unit_EEA_Read_0','user1@chippersage.com'),(7,'ae793552-ace9-4c07-9990-6c9462be4cce','EEA - 3','Prg_EEA_1_Stg_0','S1013','Unit_EEA_Read_0','user1@chippersage.com'),(8,'7ec0c125-1fee-4a15-b436-a4b8fc7def28','EEA - 3','Prg_EEA_1_Stg_0','S1014','Unit_EEA_Read_0','user1@chippersage.com'),(9,'73609a7b-36bc-43ea-a2f6-c52ae0088749','EEA - 3','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user2@chippersage.com'),(10,'a1a27b9b-4888-4c54-a9fe-c0b73042bc1e','EEA - 3','Prg_EEA_1_Stg_0','S1008','Unit_EEA_Read_0','user2@chippersage.com');
/*!40000 ALTER TABLE `user_sub_concept_completion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:03
