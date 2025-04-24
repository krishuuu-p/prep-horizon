-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: prep_horizon
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Current Database: `prep_horizon`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `prep_horizon` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `prep_horizon`;

--
-- Table structure for table `class_test`
--

DROP TABLE IF EXISTS `class_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_test` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `test_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_id` (`class_id`,`test_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `class_test_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_test_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_test`
--

LOCK TABLES `class_test` WRITE;
/*!40000 ALTER TABLE `class_test` DISABLE KEYS */;
INSERT INTO `class_test` VALUES (25,1,10),(27,1,11),(29,1,12),(31,1,13),(33,1,14),(34,1,15),(35,1,16),(26,2,10),(28,2,11),(30,2,12),(32,2,13),(36,3,17),(37,4,17);
/*!40000 ALTER TABLE `class_test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_code` varchar(20) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_code` (`class_code`),
  UNIQUE KEY `unique_class_code` (`class_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'C1','Engg Class 1','Engg class for class 11th'),(2,'C2','Engg Class 2','Engg class for class 12th'),(3,'C3','Neet Class 11th','A class for neet people.'),(4,'C4','NEet class','abc');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `class_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_class_pair` (`user_id`,`class_id`),
  KEY `student_id` (`user_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,2,1),(2,2,2),(3,5,2),(9,69,1),(6,69,3),(10,71,1),(11,72,2),(12,73,2),(7,73,3),(8,74,3),(4,83,3),(13,84,1),(5,84,4),(15,85,1),(16,86,1),(17,87,1),(18,88,1),(19,89,1);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `options`
--

DROP TABLE IF EXISTS `options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_key` enum('A','B','C','D') NOT NULL,
  `option_text` text NOT NULL,
  `option_img` varchar(255) DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` VALUES (97,37,'A','3',NULL,0),(98,37,'B','4',NULL,1),(99,37,'C','5',NULL,0),(100,37,'D','6',NULL,0),(101,39,'A','Joule',NULL,0),(102,39,'B','Newton',NULL,1),(103,39,'C','Pascal',NULL,0),(104,39,'D','Watt',NULL,0),(105,40,'A','Oxygen',NULL,0),(106,40,'B','Helium',NULL,1),(107,40,'C','Argon',NULL,1),(108,40,'D','Nitrogen',NULL,0);
/*!40000 ALTER TABLE `options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_id` int NOT NULL,
  `section_id` int NOT NULL,
  `ques_text` text NOT NULL,
  `ques_img` varchar(255) DEFAULT NULL,
  `ques_type` enum('single_correct','multi_correct','numerical') NOT NULL,
  `numerical_answer` float DEFAULT NULL,
  `positive_marks` float NOT NULL,
  `negative_marks` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `test_id` (`test_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (37,14,30,'What is 2 + 2?','test14_q1.png','single_correct',NULL,4,1),(38,14,30,'Solve for x: 2x = 10',NULL,'numerical',5,4,1),(39,14,31,'What is the unit of force?',NULL,'single_correct',NULL,4,1),(40,14,32,'Which of the following are noble gases?','test14_q2.png','multi_correct',NULL,4,1);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_id` int NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `max_marks` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (30,14,'Maths',10),(31,14,'Physics',10),(32,14,'Chemistry',10),(33,17,'Maths',10),(34,13,'Maths',10),(35,12,'Maths',10),(36,11,'Maths',10),(37,10,'Maths',10),(38,17,'Physics',10),(39,13,'Physics',10),(40,12,'Physics',10),(41,11,'Physics',10),(42,10,'Physics',10),(43,17,'Chemistry',10),(44,13,'Chemistry',10),(45,12,'Chemistry',10),(46,11,'Chemistry',10),(47,10,'Chemistry',10);
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_responses`
--

DROP TABLE IF EXISTS `student_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `question_id` int NOT NULL,
  `selected_option_id_1` int DEFAULT NULL,
  `selected_option_id_2` int DEFAULT NULL,
  `selected_option_id_3` int DEFAULT NULL,
  `selected_option_id_4` int DEFAULT NULL,
  `numerical_answer` float DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `marks_obtained` float DEFAULT '0',
  `status` enum('Not Visited','Visited but Not Answered','Answered','Marked for Review') DEFAULT 'Not Visited',
  PRIMARY KEY (`id`),
  KEY `fk_student` (`student_id`),
  KEY `fk_question` (`question_id`),
  KEY `fk_option1` (`selected_option_id_1`),
  KEY `fk_option2` (`selected_option_id_2`),
  KEY `fk_option3` (`selected_option_id_3`),
  KEY `fk_option4` (`selected_option_id_4`),
  CONSTRAINT `fk_option1` FOREIGN KEY (`selected_option_id_1`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option2` FOREIGN KEY (`selected_option_id_2`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option3` FOREIGN KEY (`selected_option_id_3`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option4` FOREIGN KEY (`selected_option_id_4`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_responses`
--

LOCK TABLES `student_responses` WRITE;
/*!40000 ALTER TABLE `student_responses` DISABLE KEYS */;
INSERT INTO `student_responses` VALUES (13,2,37,99,NULL,NULL,NULL,NULL,0,-1,'Answered'),(14,2,38,NULL,NULL,NULL,NULL,5,1,4,'Answered'),(15,2,39,102,NULL,NULL,NULL,NULL,1,4,'Answered'),(16,2,40,106,107,NULL,NULL,NULL,1,4,'Answered');
/*!40000 ALTER TABLE `student_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_results`
--

DROP TABLE IF EXISTS `student_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `test_id` int NOT NULL,
  `section_id` int NOT NULL,
  `marks_obtained` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `test_id` (`test_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `student_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_results_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_results_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_results`
--

LOCK TABLES `student_results` WRITE;
/*!40000 ALTER TABLE `student_results` DISABLE KEYS */;
INSERT INTO `student_results` VALUES (128,2,17,33,9),(129,2,17,38,7),(130,2,17,43,10),(131,2,13,34,4),(132,2,13,39,6),(133,2,13,44,10),(134,2,12,35,9),(135,2,12,40,1),(136,2,12,45,10),(137,2,11,36,8),(138,2,11,41,0),(139,2,11,46,8),(140,2,10,37,2),(141,2,10,42,1),(142,2,10,47,5),(143,87,17,33,-3),(144,87,17,38,0),(145,87,17,43,-2),(146,87,13,34,9),(147,87,13,39,10),(148,87,13,44,2),(149,87,12,35,-3),(150,87,12,40,8),(151,87,12,45,-3),(152,87,11,36,6),(153,87,11,41,3),(154,87,11,46,1),(155,87,10,37,10),(156,87,10,42,-2),(157,87,10,47,4),(158,88,17,33,0),(159,88,17,38,9),(160,88,17,43,4),(161,88,13,34,10),(162,88,13,39,1),(163,88,13,44,6),(164,88,12,35,2),(165,88,12,40,10),(166,88,12,45,7),(167,88,11,36,9),(168,88,11,41,10),(169,88,11,46,2),(170,88,10,37,-3),(171,88,10,42,-3),(172,88,10,47,-1),(173,89,17,33,5),(174,89,17,38,4),(175,89,17,43,9),(176,89,13,34,8),(177,89,13,39,1),(178,89,13,44,2),(179,89,12,35,7),(180,89,12,40,8),(181,89,12,45,6),(182,89,11,36,-3),(183,89,11,41,0),(184,89,11,46,-3),(185,89,10,37,1),(186,89,10,42,6),(187,89,10,47,2),(188,84,17,33,9),(189,84,17,38,0),(190,84,17,43,5),(191,84,13,34,-2),(192,84,13,39,10),(193,84,13,44,3),(194,84,12,35,0),(195,84,12,40,9),(196,84,12,45,9),(197,84,11,36,6),(198,84,11,41,6),(199,84,11,46,3),(200,84,10,37,-2),(201,84,10,42,-1),(202,84,10,47,6),(203,85,17,33,8),(204,85,17,38,-1),(205,85,17,43,2),(206,85,13,34,1),(207,85,13,39,2),(208,85,13,44,10),(209,85,12,35,8),(210,85,12,40,-1),(211,85,12,45,4),(212,85,11,36,-2),(213,85,11,41,8),(214,85,11,46,7),(215,85,10,37,-1),(216,85,10,42,8),(217,85,10,47,4),(218,86,17,33,0),(219,86,17,38,6),(220,86,17,43,6),(221,86,13,34,1),(222,86,13,39,2),(223,86,13,44,-1),(224,86,12,35,6),(225,86,12,40,7),(226,86,12,45,8),(227,86,11,36,8),(228,86,11,41,8),(229,86,11,46,2),(230,86,10,37,7),(231,86,10,42,2),(232,86,10,47,7);
/*!40000 ALTER TABLE `student_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_tests`
--

DROP TABLE IF EXISTS `student_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `test_id` int NOT NULL,
  `start_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `student_tests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_tests_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_tests`
--

LOCK TABLES `student_tests` WRITE;
/*!40000 ALTER TABLE `student_tests` DISABLE KEYS */;
INSERT INTO `student_tests` VALUES (1,2,14,'2025-04-18 18:00:00');
/*!40000 ALTER TABLE `student_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tests`
--

DROP TABLE IF EXISTS `tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_name` varchar(100) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_marks` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `duration` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tests_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
INSERT INTO `tests` VALUES (10,'FTS01- Mains','2025-03-25 10:00:00','2025-03-26 13:00:00',30,1,10800),(11,'FTS02- Mains','2025-04-06 10:00:00','2025-04-06 13:00:00',30,1,10800),(12,'FTS02- Advanced Paper 1','2025-04-10 10:00:00','2025-04-12 13:00:00',30,1,10800),(13,'FTS02- Advanced Paper 2','2025-04-10 10:00:00','2025-04-12 13:00:00',30,1,10800),(14,'FTS03- Mains','2025-04-15 10:00:00','2025-04-26 13:00:00',30,1,10800),(15,'FTS03- Advanced Paper 1','2025-04-25 10:00:00','2025-04-26 13:00:00',30,1,10800),(16,'FTS03- Advanced Paper 2','2025-04-25 10:00:00','2025-04-26 13:00:00',30,1,10800),(17,'FTS04 - AIATS','2025-04-15 10:00:00','2025-04-15 10:00:00',30,1,10800);
/*!40000 ALTER TABLE `tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'A1','$2b$10$W2amF2fmf/cza662x.uUnuLr.lb2wfRoLz02BR4yP5pXRPMGSct1q','Admin 1','admin1@gmail.com','admin'),(2,'S1','$2b$10$mVpyvddhPVSMRQ7vp./HxOrPdQaw2FzwlP45zPQfPSsRngwaC9GxG','Student 1','student1@gamil.com','student'),(5,'S2','$2b$10$xPkjQwc5ivd0u08phkupg.TO6YWmQlaIwmptzefTFVsGl6S5YxUNC','Student 2','student2@gmail.com','student'),(66,'S3','$2b$10$OpCrbpm75zztnYK3Zi2hsuHziTgHQnCSCKIkOpDxreWL9x3fQWUUu','Student 3','student3@gmail.com','student'),(67,'S4','$2b$10$jKcn1VwzXeUcZJmLZxwkJuXJOMrH4gMxiBtslR7jp9KdXHsFoP51m','Student 4','student4@gmail.com','student'),(68,'S5','$2b$10$5VcTxjUT4Kpdu1hz7qNRmemFW4FBLsy/Z8OIlbT..iBYhuR3kyF5O','Student 5','student5@gmail.com','student'),(69,'T1','$2b$10$N.SucYRIl68WOd5kZb0fReIKlzXShA3l671Vn0EpdEsZRoLuZFqLm','Teacher 1','teacher1@gmail.com','teacher'),(71,'T2','$2b$10$GtmqsMv1rlN/hJQW1p3aCegV2diiOdDQ19mdZU6/ZkgBb.j0rHL2C','Teacher 2','teacher2@gmail.com','teacher'),(72,'T3','$2b$10$yEJi/hpXXF3G5rCqnlRb5./a7U8mkuv4lL1FLr5.NJ2Kc52Yw6CbO','Teacher 3','teacher3@gmail.com','teacher'),(73,'T4','$2b$10$8JmR3v3mlJx2lluZjeAuz.a5EtmD3lFKpjRYJb930XsFZ1o5O/QZG','Teacher 4','teacher4@gmail.com','teacher'),(74,'T5','$2b$10$.DuQaE5nvwJ8q0tjIlaNheY/uPJ9iRCyumbyQ/VsvvUYFjwrnQ/0C','Teacher 5','teacher5@gmail.com','teacher'),(83,'S6','$2b$10$.LUI/nw2BLGoICoEYIK2Q.s1fE36XsD.0eQB2XbO9uiu1/GoHR6b6','Student 6','studentsix@gmail.com','student'),(84,'S7','$2b$10$eLZXyFxtcUOvO/Ob8ApFa.69d7IQLg3VgkjTHMkciI7P4BPbE45hO','student 7','lsjbsjlb','student'),(85,'S8','$2b$10$epaXksP1lqSfSX5ccZAguuEnubElFCswQ.yx0mG374e19RDqMDZTe','student 8','student8@gmail.com','student'),(86,'S9','$2b$10$OY9oeZAiXejpo0/v6dKsue3UBDbL4u5.0IGx00Jo0vIpFhy31Es7q','student 9','student9@gmail.com','student'),(87,'S10','$2b$10$yqsrktuN4xxxg3CcIRP3ieL2Bzp7t/ZlVNowsT9RvAAkKUGmlnh1m','student 10','student10@gmail.com','student'),(88,'S11','$2b$10$Go7PwzdfVggaE9MB1jsFEO3FaSa5CErb8/Ga8r5yZJa8/DMGU3FxS','student 11','student11@gmail.com','student'),(89,'S12','$2b$10$MwM5AEayjhDYpWyxHgkM9uv.VuRXzgUqjL9cyPs6TR/SFEPN9Azwy','student 12','student12@gmail.com','student'),(90,'S13','$2b$10$oQVmsrvqiTkf/Pxenn8csOzizYRw2A1SR06wf.4.wKwk2UWYIxaWi','student 13','student13@gmail.com','student'),(91,'S14','$2b$10$KjWPgYHPsTmmOvInAwh3/ujrLfnxgnF8b827D.c6DZvAz9oMxWcSe','student 14','student14@gmail.com','student'),(92,'S15','$2b$10$NrSJYqy.RlzbY8Iykrrkdej8Utmv4gm0zByxdHgzjNc.sEKJCkWgW','student 15','student15@gmail.com','student');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-25  0:26:13
