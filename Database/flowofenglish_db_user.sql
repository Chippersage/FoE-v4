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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `user_address` varchar(200) DEFAULT NULL,
  `user_email` varchar(50) NOT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `user_phone_number` varchar(12) DEFAULT NULL,
  `uuid` varchar(255) NOT NULL,
  `organization_id` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_type` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK1xc1iry6gqjrvh5cpajiq7l2f` (`uuid`),
  KEY `FKnc7qi4wh8hj8l5523fxeox209` (`organization_id`),
  CONSTRAINT `FKnc7qi4wh8hj8l5523fxeox209` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('user1@chippersage.com','Kundalahalli','user1@chippersage.com','Mamta','6301615610','61436357-8060-4abb-8c96-6e56272609f5','Chipper','Hari123','Student'),('user2@chippersage.com','K R Puram','user2@chippersage.com','Seema','6301615610','39bd7776-7165-478e-8d1f-e49655a01777','Chipper','Hari123',NULL),('user3@chippersage.com','AECS Layout','user3@chippersage.com','Niraj','6391656201','1b01c725-4d52-47ea-8527-17cff46271ed','Chipper','Hari123',NULL),('user4@chippersage.com','AECS Layout','user4@chippersage.com','raj','6391656201','663e1d02-0633-4f55-b707-db9340db0521','Chipper','Hari123',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
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
