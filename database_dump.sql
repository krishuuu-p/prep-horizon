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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_test`
--

LOCK TABLES `class_test` WRITE;
/*!40000 ALTER TABLE `class_test` DISABLE KEYS */;
INSERT INTO `class_test` VALUES (12,1,1),(14,1,2),(16,1,3),(18,1,4),(20,1,5),(21,1,6),(22,1,7),(13,2,1),(15,2,2),(17,2,3),(19,2,4),(23,3,8),(24,4,9);
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
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,2,1),(2,2,2),(3,5,2),(4,83,3),(5,84,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` VALUES (1,5,'A','3',NULL,0),(2,5,'B','4',NULL,1),(3,5,'C','5',NULL,0),(4,5,'D','6',NULL,0),(5,7,'A','Joule',NULL,0),(6,7,'B','Newton',NULL,1),(7,7,'C','Pascal',NULL,0),(8,7,'D','Watt',NULL,0),(9,8,'A','Oxygen',NULL,0),(10,8,'B','Helium',NULL,1),(11,8,'C','Argon',NULL,1),(12,8,'D','Nitrogen',NULL,0),(13,9,'A','3',NULL,0),(14,9,'B','4',NULL,1),(15,9,'C','5',NULL,0),(16,9,'D','6',NULL,0),(17,11,'A','Joule',NULL,0),(18,11,'B','Newton',NULL,1),(19,11,'C','Pascal',NULL,0),(20,11,'D','Watt',NULL,0),(21,12,'A','Oxygen',NULL,0),(22,12,'B','Helium',NULL,1),(23,12,'C','Argon',NULL,1),(24,12,'D','Nitrogen',NULL,0);
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
  `numerical_answer` text,
  `positive_marks` float NOT NULL,
  `negative_marks` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `test_id` (`test_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (5,5,6,'What is 2 + 2?','test5_q1.png','single_correct',NULL,4,1),(6,5,6,'Solve for x: 2x = 10',NULL,'numerical','5',4,1),(7,5,7,'What is the unit of force?',NULL,'single_correct',NULL,4,1),(8,5,8,'Which of the following are noble gases?','test5_q2.png','multi_correct',NULL,4,1),(9,5,9,'What is 2 + 2?','test5_q1.png','single_correct',NULL,4,1),(10,5,9,'Solve for x: 2x = 10',NULL,'numerical','5',4,1),(11,5,10,'What is the unit of force?',NULL,'single_correct',NULL,4,1),(12,5,11,'Which of the following are noble gases?','test5_q2.png','multi_correct',NULL,4,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (6,5,'Maths',0),(7,5,'Physics',0),(8,5,'Chemistry',0),(9,5,'Maths',0),(10,5,'Physics',0),(11,5,'Chemistry',0);
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
  `selected_option_1_id` int DEFAULT NULL,
  `selected_option_2_id` int DEFAULT NULL,
  `selected_option_3_id` int DEFAULT NULL,
  `selected_option_4_id` int DEFAULT NULL,
  `numerical_answer` float DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `marks_obtained` float DEFAULT '0',
  `status` enum('Not Visited','Visited but Not Answered','Answered','Marked for Review') DEFAULT 'Not Visited',
  PRIMARY KEY (`id`),
  KEY `fk_student` (`student_id`),
  KEY `fk_question` (`question_id`),
  KEY `fk_option1` (`selected_option_1_id`),
  KEY `fk_option2` (`selected_option_2_id`),
  KEY `fk_option3` (`selected_option_3_id`),
  KEY `fk_option4` (`selected_option_4_id`),
  CONSTRAINT `fk_option1` FOREIGN KEY (`selected_option_1_id`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option2` FOREIGN KEY (`selected_option_2_id`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option3` FOREIGN KEY (`selected_option_3_id`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_option4` FOREIGN KEY (`selected_option_4_id`) REFERENCES `options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_responses`
--

LOCK TABLES `student_responses` WRITE;
/*!40000 ALTER TABLE `student_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_responses` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `student_tests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_tests_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_tests`
--

LOCK TABLES `student_tests` WRITE;
/*!40000 ALTER TABLE `student_tests` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tests_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
INSERT INTO `tests` VALUES (1,'FTS01- Mains','2025-03-25 10:00:00','2025-03-26 13:00:00',300,1),(2,'FTS02- Mains','2025-04-06 10:00:00','2025-04-06 13:00:00',300,1),(3,'FTS02- Advanced Paper 1','2025-04-10 10:00:00','2025-04-12 13:00:00',180,1),(4,'FTS02- Advanced Paper 2','2025-04-10 10:00:00','2025-04-12 13:00:00',180,1),(5,'FTS03- Mains','2025-04-13 10:00:00','2025-04-17 13:00:00',300,1),(6,'FTS03- Advanced Paper 1','2025-04-25 10:00:00','2025-04-26 13:00:00',180,1),(7,'FTS03- Advanced Paper 2','2025-04-25 10:00:00','2025-04-26 13:00:00',180,1),(8,'FTS04 - AIATS','2025-04-15 10:00:00','2025-04-16 10:00:00',720,1),(9,'FTS05 - AIATS','2025-04-15 10:00:00','2025-04-16 10:00:00',720,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'A1','$2b$10$W2amF2fmf/cza662x.uUnuLr.lb2wfRoLz02BR4yP5pXRPMGSct1q','Admin 1','admin1@gmail.com','admin'),(2,'S1','$2b$10$mVpyvddhPVSMRQ7vp./HxOrPdQaw2FzwlP45zPQfPSsRngwaC9GxG','Student 1','student1@gamil.com','student'),(5,'S2','$2b$10$xPkjQwc5ivd0u08phkupg.TO6YWmQlaIwmptzefTFVsGl6S5YxUNC','Student 2','student2@gmail.com','student'),(66,'S3','$2b$10$OpCrbpm75zztnYK3Zi2hsuHziTgHQnCSCKIkOpDxreWL9x3fQWUUu','Student 3','student3@gmail.com','student'),(67,'S4','$2b$10$jKcn1VwzXeUcZJmLZxwkJuXJOMrH4gMxiBtslR7jp9KdXHsFoP51m','Student 4','student4@gmail.com','student'),(68,'S5','$2b$10$5VcTxjUT4Kpdu1hz7qNRmemFW4FBLsy/Z8OIlbT..iBYhuR3kyF5O','Student 5','student5@gmail.com','student'),(69,'T1','$2b$10$N.SucYRIl68WOd5kZb0fReIKlzXShA3l671Vn0EpdEsZRoLuZFqLm','Teacher 1','teacher1@gmail.com','teacher'),(71,'T2','$2b$10$GtmqsMv1rlN/hJQW1p3aCegV2diiOdDQ19mdZU6/ZkgBb.j0rHL2C','Teacher 2','teacher2@gmail.com','teacher'),(72,'T3','$2b$10$yEJi/hpXXF3G5rCqnlRb5./a7U8mkuv4lL1FLr5.NJ2Kc52Yw6CbO','Teacher 3','teacher3@gmail.com','teacher'),(73,'T4','$2b$10$8JmR3v3mlJx2lluZjeAuz.a5EtmD3lFKpjRYJb930XsFZ1o5O/QZG','Teacher 4','teacher4@gmail.com','teacher'),(74,'T5','$2b$10$.DuQaE5nvwJ8q0tjIlaNheY/uPJ9iRCyumbyQ/VsvvUYFjwrnQ/0C','Teacher 5','teacher5@gmail.com','teacher'),(83,'S6','$2b$10$.LUI/nw2BLGoICoEYIK2Q.s1fE36XsD.0eQB2XbO9uiu1/GoHR6b6','Student 6','studentsix@gmail.com','student'),(84,'S7','$2b$10$eLZXyFxtcUOvO/Ob8ApFa.69d7IQLg3VgkjTHMkciI7P4BPbE45hO','student 7','lsjbsjlb','student');
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

-- Dump completed on 2025-04-13 23:12:15
