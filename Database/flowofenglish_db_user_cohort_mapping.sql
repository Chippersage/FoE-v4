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
-- Table structure for table `user_cohort_mapping`
--

DROP TABLE IF EXISTS `user_cohort_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cohort_mapping` (
  `user_cohort_id` int NOT NULL AUTO_INCREMENT,
  `leaderboard_score` int DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  `cohort_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`user_cohort_id`),
  UNIQUE KEY `UK6gtof2vfompkv0eu5g3bok53f` (`uuid`),
  KEY `FKt4vaeurev7g773yswyop02gka` (`user_id`),
  KEY `FKrf47o4hb7reg8qx1wghy66hwj` (`cohort_id`),
  CONSTRAINT `FKrf47o4hb7reg8qx1wghy66hwj` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`cohort_id`),
  CONSTRAINT `FKt4vaeurev7g773yswyop02gka` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_cohort_mapping`
--

LOCK TABLES `user_cohort_mapping` WRITE;
/*!40000 ALTER TABLE `user_cohort_mapping` DISABLE KEYS */;
INSERT INTO `user_cohort_mapping` VALUES (2,125,'95799a60-ee26-46a9-a97e-b90da21cc53a','Cht_Sep-24-Bhive','user1@chippersage.com'),(3,10,'4c23b3a3-b925-4f99-86f5-ac1913cdbcbb','Cht_Sep-24-Bhive','user2@chippersage.com');
/*!40000 ALTER TABLE `user_cohort_mapping` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-01 12:47:06
