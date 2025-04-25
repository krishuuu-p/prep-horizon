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
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` VALUES (97,37,'A','3',NULL,0),(98,37,'B','4',NULL,1),(99,37,'C','5',NULL,0),(100,37,'D','6',NULL,0),(101,39,'A','Joule',NULL,0),(102,39,'B','Newton',NULL,1),(103,39,'C','Pascal',NULL,0),(104,39,'D','Watt',NULL,0),(105,40,'A','Oxygen',NULL,0),(106,40,'B','Helium',NULL,1),(107,40,'C','Argon',NULL,1),(108,40,'D','Nitrogen',NULL,0),(109,41,'A','cos(x)',NULL,1),(110,41,'B','-cos(x)',NULL,0),(111,41,'C','sin(x)',NULL,0),(112,41,'D','-sin(x)',NULL,0),(113,43,'A','11',NULL,1),(114,43,'B','15',NULL,0),(115,43,'C','17',NULL,1),(116,43,'D','21',NULL,0),(117,44,'A','ln|x| + C',NULL,1),(118,44,'B','x',NULL,0),(119,44,'C','1/x',NULL,0),(120,44,'D','x²',NULL,0),(121,45,'A','2',NULL,1),(122,45,'B','3',NULL,0),(123,45,'C','6',NULL,1),(124,45,'D','7',NULL,0),(125,47,'A','0',NULL,0),(126,47,'B','1',NULL,1),(127,47,'C','-1',NULL,0),(128,47,'D','Undefined',NULL,0),(129,48,'A','2',NULL,1),(130,48,'B','-2',NULL,1),(131,48,'C','0',NULL,0),(132,48,'D','4',NULL,0),(133,49,'A','9.8 m/s²',NULL,1),(134,49,'B','8.9 m/s²',NULL,0),(135,49,'C','10.8 m/s²',NULL,0),(136,49,'D','7.5 m/s²',NULL,0),(137,51,'A','Velocity',NULL,1),(138,51,'B','Distance',NULL,0),(139,51,'C','Force',NULL,1),(140,51,'D','Speed',NULL,0),(141,52,'A','Joule',NULL,1),(142,52,'B','Watt',NULL,0),(143,52,'C','Newton',NULL,0),(144,52,'D','Erg',NULL,0),(145,53,'A','Length',NULL,1),(146,53,'B','Mass',NULL,1),(147,53,'C','Speed',NULL,0),(148,53,'D','Time',NULL,1),(149,55,'A','Uniform acceleration',NULL,1),(150,55,'B','Non-uniform acceleration',NULL,0),(151,55,'C','Zero acceleration',NULL,0),(152,55,'D','No motion',NULL,0),(153,56,'A','Joule',NULL,1),(154,56,'B','Calorie',NULL,1),(155,56,'C','Newton',NULL,0),(156,56,'D','Watt-hour',NULL,1),(157,58,'A','6',NULL,1),(158,58,'B','12',NULL,0),(159,58,'C','14',NULL,0),(160,58,'D','8',NULL,0),(161,60,'A','O₂',NULL,1),(162,60,'B','N₂',NULL,1),(163,60,'C','H₂O',NULL,0),(164,60,'D','H₂',NULL,1),(165,61,'A','Calcium',NULL,0),(166,61,'B','Potassium',NULL,1),(167,61,'C','Iron',NULL,0),(168,61,'D','Aluminum',NULL,0),(169,63,'A','HCl',NULL,1),(170,63,'B','NaOH',NULL,0),(171,63,'C','H₂SO₄',NULL,1),(172,63,'D','KOH',NULL,0),(173,64,'A','H2O',NULL,1),(174,64,'B','CO2',NULL,0),(175,64,'C','O2',NULL,0),(176,64,'D','NaCl',NULL,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (37,14,30,'What is 2 + 2?','test14_q1.png','single_correct',NULL,4,1),(38,14,30,'Solve for x: 2x = 10',NULL,'numerical',5,4,1),(39,14,31,'What is the unit of force?',NULL,'single_correct',NULL,4,1),(40,14,32,'Which of the following are noble gases?','test14_q2.png','multi_correct',NULL,4,1),(41,14,30,'What is the derivative of sin(x)?',NULL,'single_correct',NULL,4,1),(42,14,30,'Solve: What is the value of √144?',NULL,'numerical',12,4,1),(43,14,30,'Which of the following numbers are prime?',NULL,'multi_correct',NULL,4,1),(44,14,30,'What is the integral of 1/x dx?',NULL,'single_correct',NULL,4,1),(45,14,30,'Which of the following are even numbers?',NULL,'multi_correct',NULL,4,1),(46,14,30,'What is the square of 13?',NULL,'numerical',169,4,1),(47,14,30,'What is the value of sin(90°)?',NULL,'single_correct',NULL,4,1),(48,14,30,'Which of these are solutions of x² = 4?',NULL,'multi_correct',NULL,4,1),(49,14,31,'What is the acceleration due to gravity on Earth?',NULL,'single_correct',NULL,4,1),(50,14,31,'A body moves with uniform velocity of 5 m/s for 10 s. What is the distance covered?',NULL,'numerical',50,4,1),(51,14,31,'Which of the following are vector quantities?',NULL,'multi_correct',NULL,4,1),(52,14,31,'What is the SI unit of work?',NULL,'single_correct',NULL,4,1),(53,14,31,'Which of these are fundamental quantities?',NULL,'multi_correct',NULL,4,1),(54,14,31,'If a = 2 m/s² and t = 3 s, find velocity assuming initial velocity is 0.',NULL,'numerical',6,4,1),(55,14,31,'What does a speed-time graph represent when it’s a straight line?',NULL,'single_correct',NULL,4,1),(56,14,31,'Which of the following are units of energy?',NULL,'multi_correct',NULL,4,1),(57,14,31,'What is the frequency of a wave with time period 0.01 s?',NULL,'numerical',100,4,1),(58,14,32,'What is the atomic number of Carbon?',NULL,'single_correct',NULL,4,1),(59,14,32,'Calculate the number of moles in 44g of CO₂. (Molar mass of CO₂ = 44 g/mol)',NULL,'numerical',1,4,1),(60,14,32,'Which of the following are diatomic molecules?',NULL,'multi_correct',NULL,4,1),(61,14,32,'Which of the following is an alkali metal?',NULL,'single_correct',NULL,4,1),(62,14,32,'How many protons does Sodium (Na) have?',NULL,'numerical',11,4,1),(63,14,32,'Which of the following are acids?',NULL,'multi_correct',NULL,4,1),(64,14,32,'What is the chemical formula of water?',NULL,'single_correct',NULL,4,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (30,14,'Maths',10),(31,14,'Physics',10),(32,14,'Chemistry',10),(33,17,'Maths',10),(34,13,'Maths',10),(35,12,'Maths',10),(36,11,'Maths',10),(37,10,'Maths',10),(38,17,'Physics',10),(39,13,'Physics',10),(40,12,'Physics',10),(41,11,'Physics',10),(42,10,'Physics',10),(43,17,'Chemistry',10),(44,13,'Chemistry',10),(45,12,'Chemistry',10),(46,11,'Chemistry',10),(47,10,'Chemistry',10),(48,13,'Maths',10),(49,12,'Maths',10),(50,11,'Maths',10),(51,10,'Maths',10),(52,13,'Physics',10),(53,12,'Physics',10),(54,11,'Physics',10),(55,10,'Physics',10),(56,13,'Chemistry',10),(57,12,'Chemistry',10),(58,11,'Chemistry',10),(59,10,'Chemistry',10);
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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_responses`
--

LOCK TABLES `student_responses` WRITE;
/*!40000 ALTER TABLE `student_responses` DISABLE KEYS */;
INSERT INTO `student_responses` VALUES (21,2,37,98,NULL,NULL,NULL,NULL,1,4,'Answered'),(22,2,38,NULL,NULL,NULL,NULL,5,0,-1,'Answered'),(23,2,39,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(24,2,40,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(25,2,41,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(26,2,42,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(27,2,43,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(28,2,44,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(29,2,45,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(30,2,46,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(31,2,47,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(32,2,48,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(33,2,49,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(34,2,50,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(35,2,51,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(36,2,52,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(37,2,53,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(38,2,54,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(39,2,55,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(40,2,56,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(41,2,57,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(42,2,58,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(43,2,59,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(44,2,60,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(45,2,61,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(46,2,62,NULL,NULL,NULL,NULL,NULL,0,-1,'Not Visited'),(47,2,63,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited'),(48,2,64,NULL,NULL,NULL,NULL,NULL,0,0,'Not Visited');
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
) ENGINE=InnoDB AUTO_INCREMENT=385 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_results`
--

LOCK TABLES `student_results` WRITE;
/*!40000 ALTER TABLE `student_results` DISABLE KEYS */;
INSERT INTO `student_results` VALUES (258,2,13,34,10),(259,2,13,39,7),(260,2,13,44,9),(261,2,12,35,0),(262,2,12,40,5),(263,2,12,45,0),(264,2,11,36,1),(265,2,11,41,-3),(266,2,11,46,-2),(267,2,10,37,4),(268,2,10,42,1),(269,2,10,47,-2),(270,87,13,34,2),(271,87,13,39,8),(272,87,13,44,10),(273,87,12,35,-1),(274,87,12,40,-1),(275,87,12,45,-1),(276,87,11,36,4),(277,87,11,41,-2),(278,87,11,46,8),(279,87,10,37,10),(280,87,10,42,-2),(281,87,10,47,8),(282,88,13,34,9),(283,88,13,39,7),(284,88,13,44,0),(285,88,12,35,10),(286,88,12,40,9),(287,88,12,45,7),(288,88,11,36,-3),(289,88,11,41,9),(290,88,11,46,2),(291,88,10,37,1),(292,88,10,42,1),(293,88,10,47,7),(294,89,13,34,5),(295,89,13,39,9),(296,89,13,44,7),(297,89,12,35,-2),(298,89,12,40,-1),(299,89,12,45,5),(300,89,11,36,2),(301,89,11,41,-1),(302,89,11,46,8),(303,89,10,37,5),(304,89,10,42,6),(305,89,10,47,1),(306,84,13,34,7),(307,84,13,39,5),(308,84,13,44,10),(309,84,12,35,8),(310,84,12,40,3),(311,84,12,45,6),(312,84,11,36,9),(313,84,11,41,6),(314,84,11,46,3),(315,84,10,37,2),(316,84,10,42,4),(317,84,10,47,2),(318,85,13,34,3),(319,85,13,39,-1),(320,85,13,44,4),(321,85,12,35,10),(322,85,12,40,0),(323,85,12,45,3),(324,85,11,36,4),(325,85,11,41,-1),(326,85,11,46,2),(327,85,10,37,4),(328,85,10,42,1),(329,85,10,47,10),(330,86,13,34,9),(331,86,13,39,5),(332,86,13,44,3),(333,86,12,35,1),(334,86,12,40,2),(335,86,12,45,7),(336,86,11,36,8),(337,86,11,41,6),(338,86,11,46,10),(339,86,10,37,6),(340,86,10,42,6),(341,86,10,47,0);
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
  `is_submitted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `student_tests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_tests_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_tests`
--

LOCK TABLES `student_tests` WRITE;
/*!40000 ALTER TABLE `student_tests` DISABLE KEYS */;
INSERT INTO `student_tests` VALUES (3,2,14,'2025-04-25 15:39:23',0);
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
INSERT INTO `tests` VALUES (10,'FTS01- Mains','2025-03-25 10:00:00','2025-03-26 13:00:00',30,1,10800),(11,'FTS02- Mains','2025-04-06 10:00:00','2025-04-06 13:00:00',30,1,10800),(12,'FTS02- Advanced Paper 1','2025-04-20 10:00:00','2025-04-21 17:00:00',30,1,10800),(13,'FTS02- Advanced Paper 2','2025-04-20 10:00:00','2025-04-21 17:00:00',30,1,10800),(14,'FTS03- Mains','2025-04-25 10:00:00','2025-04-26 19:00:00',30,1,10800),(15,'FTS03- Advanced Paper 1','2025-04-30 10:00:00','2025-05-01 17:00:00',30,1,10800),(16,'FTS03- Advanced Paper 2','2025-04-30 10:00:00','2025-05-01 17:00:00',30,1,10800),(17,'FTS04 - AIATS','2025-05-05 10:00:00','2025-05-06 17:00:00',30,1,10800);
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

-- Dump completed on 2025-04-25 15:43:48
