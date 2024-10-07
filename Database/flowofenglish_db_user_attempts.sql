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
-- Table structure for table `user_attempts`
--

DROP TABLE IF EXISTS `user_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_attempts` (
  `user_attempt_id` bigint NOT NULL AUTO_INCREMENT,
  `user_attempt_end_timestamp` datetime(6) DEFAULT NULL,
  `user_attempt_flag` bit(1) NOT NULL,
  `user_attempt_score` int NOT NULL,
  `user_attempt_start_timestamp` datetime(6) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `program_id` varchar(500) NOT NULL,
  `session_id` varchar(128) DEFAULT NULL,
  `stage_id` varchar(255) NOT NULL,
  `subconcept_id` varchar(255) NOT NULL,
  `unit_id` varchar(500) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`user_attempt_id`),
  UNIQUE KEY `UKn71hx9bhxfj62ccpxhneosgdc` (`uuid`),
  KEY `FKop3htkxsvyb7ajt8li0kk8w12` (`program_id`),
  KEY `FK935tx22v2xiun05hvlci0j225` (`stage_id`),
  KEY `FK245wmab59cyxm6dssvxfwi4dw` (`subconcept_id`),
  KEY `FKaw4yhwg7aw9shd9vw88vv94es` (`unit_id`),
  KEY `FKnyewmn0y1be4jjuam8ag1q5t` (`user_id`),
  KEY `FK5gvypegyhyky6mqk7tjg026ar` (`session_id`),
  CONSTRAINT `FK245wmab59cyxm6dssvxfwi4dw` FOREIGN KEY (`subconcept_id`) REFERENCES `subconcept` (`subconcept_id`),
  CONSTRAINT `FK5gvypegyhyky6mqk7tjg026ar` FOREIGN KEY (`session_id`) REFERENCES `user_session_mapping` (`session_id`),
  CONSTRAINT `FK935tx22v2xiun05hvlci0j225` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`),
  CONSTRAINT `FKaw4yhwg7aw9shd9vw88vv94es` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`),
  CONSTRAINT `FKnyewmn0y1be4jjuam8ag1q5t` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `FKop3htkxsvyb7ajt8li0kk8w12` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_attempts`
--

LOCK TABLES `user_attempts` WRITE;
/*!40000 ALTER TABLE `user_attempts` DISABLE KEYS */;
INSERT INTO `user_attempts` VALUES (1,'2024-09-23 10:30:00.000000',_binary '',5,'2024-09-23 09:00:00.000000','a1dabca5-20f7-4b10-8963-dfbc5d764d1d','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(2,'2024-09-23 10:30:00.000000',_binary '',10,'2024-09-23 09:00:00.000000','2bee2076-2e38-4845-9eee-1a60ee9148a2','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(3,'2024-09-23 10:30:00.000000',_binary '',10,'2024-09-23 09:00:00.000000','b693cd7c-68e2-460b-adea-51fc30bf153c','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(4,'2024-09-24 10:35:25.251000',_binary '',1,'2024-09-24 10:35:25.251000','574c60df-697f-445a-a579-42df857acedf','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(5,'2024-09-24 10:51:48.775000',_binary '',4,'2024-09-24 10:51:48.775000','5274ac41-eea6-4b9f-851c-f3f3d568e57c','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com'),(6,'2024-09-23 10:30:00.000000',_binary '',10,'2024-09-23 09:00:00.000000','171f8e11-5726-4656-ab2b-96ddb217c814','EEA - 3','744ef498c7704b668cc167d973047394506625989029300','Prg_EEA_1_Stg_0','S1007','Unit_EEA_Read_0','user1@chippersage.com');
/*!40000 ALTER TABLE `user_attempts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:08
