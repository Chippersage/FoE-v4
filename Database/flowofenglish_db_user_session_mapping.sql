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
-- Table structure for table `user_session_mapping`
--

DROP TABLE IF EXISTS `user_session_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_session_mapping` (
  `session_id` varchar(128) NOT NULL,
  `session_end_timestamp` datetime(6) DEFAULT NULL,
  `session_start_timestamp` datetime(6) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  `cohort_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `UKnkxd37iitw360ttr93tjcdh4g` (`uuid`),
  KEY `FKtb0qjbhjw7lif75l29m10mbq8` (`cohort_id`),
  KEY `FKmkj75kfbij1yxnyft9ie9eng9` (`user_id`),
  CONSTRAINT `FKmkj75kfbij1yxnyft9ie9eng9` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `FKtb0qjbhjw7lif75l29m10mbq8` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`cohort_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_session_mapping`
--

LOCK TABLES `user_session_mapping` WRITE;
/*!40000 ALTER TABLE `user_session_mapping` DISABLE KEYS */;
INSERT INTO `user_session_mapping` VALUES ('42061985AE595175FE73E0590CC314CD','2024-09-27 11:26:41.980508','2024-09-27 11:25:56.152319','ea295047-515f-4229-a3ba-f5a0f12e5df8','Cht_Sep-24-Bhive','user1@chippersage.com'),('4CE5839A11FA440EDAB4053B6A8A8F2B','2024-10-01 12:09:58.268328','2024-10-01 12:08:33.883740','9b2a22b6-55bf-49e6-a19b-fa5bea39e7be','Cht_Sep-24-Bhive','user1@chippersage.com'),('527540E1C19209BB815BCC759E19D3E9','2024-10-01 12:08:22.891565','2024-10-01 12:04:13.651529','f294b240-a695-464b-b6d0-e6f90617baf0','Cht_Sep-24-Bhive','user1@chippersage.com'),('744ef498c7704b668cc167d973047394506625989029300','2024-09-23 18:30:00.000000','2024-09-23 17:30:00.000000','3d9ffeec-4707-4a9d-bc41-1030427630f6','Cht_Sep-24-Bhive','user1@chippersage.com'),('7792F5D55A78A214BF0A7311D6DD058C',NULL,'2024-09-26 13:13:09.673496','eb028103-9bf8-4b02-a89b-19ec86655b8c','Cht_Sep-24-Bhive','user1@chippersage.com'),('A97A2DEBDD7CE663276BC50287432D9A','2024-09-26 15:59:47.512748','2024-09-26 15:58:06.820181','b506eddf-5578-4c6c-a3ff-5b14501defcc','Cht_Sep-24-Bhive','user2@chippersage.com'),('BAD7ADC2E74EACB294E10CBCE9826FBB','2024-09-26 16:01:43.598619','2024-09-26 16:01:22.994471','c416e689-5ff4-4951-b6d0-30a95d76910c','Cht_Sep-24-Bhive','user1@chippersage.com'),('ef6fc1bf028e433ab952d4d4dc0e0737506655075258000',NULL,NULL,'c3edf592-5962-4727-985a-d5df6ea16a73','Cht_Sep-24-Bhive','user1@chippersage.com'),('F4F54B285645DF9E00E08B9587D91CE5',NULL,'2024-10-01 12:10:07.295462','6f4f863e-8781-4fab-a118-71720dc358fd','Cht_Sep-24-Bhive','user1@chippersage.com');
/*!40000 ALTER TABLE `user_session_mapping` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:04
