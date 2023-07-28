CREATE DATABASE  IF NOT EXISTS `nodelogin` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `nodelogin`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: nodelogin
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `App_Acronym` varchar(45) NOT NULL,
  `App_Description` longtext NOT NULL,
  `App_Rnumber` int NOT NULL,
  `App_startDate` date DEFAULT NULL,
  `App_endDate` date DEFAULT NULL,
  `App_permit_Open` varchar(255) DEFAULT NULL,
  `App_permit_toDoList` varchar(255) DEFAULT NULL,
  `App_permit_Doing` varchar(255) DEFAULT NULL,
  `App_permit_Done` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`App_Acronym`),
  UNIQUE KEY `App_Acronym_UNIQUE` (`App_Acronym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES ('eatwhat','Something to come up with later',4,'2023-06-23','2025-07-22','.pm.','.dev.','.admin','.dev.'),('EatWhat2','Something to come up with later',1,'2022-03-22','2024-03-24','.dev.','.dev.user.','.dev.','.admin.'),('somerandomApp2','Something to come up with later',1,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `groupid` int NOT NULL AUTO_INCREMENT,
  `groupname` varchar(45) NOT NULL,
  PRIMARY KEY (`groupid`),
  UNIQUE KEY `groupname_UNIQUE` (`groupname`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'admin'),(27,'dev'),(2,'user');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `Plan_MVP_name` varchar(255) NOT NULL,
  `Plan_startDate` date DEFAULT NULL,
  `Plan_endDate` date DEFAULT NULL,
  `Plan_app_Acronym` varchar(255) NOT NULL,
  PRIMARY KEY (`Plan_MVP_name`),
  UNIQUE KEY `Plan_MVP_name_UNIQUE` (`Plan_MVP_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES ('Sprint1','2023-02-10','2024-03-22','eatwhat'),('Sprint2','2023-02-24','2024-03-23','eatwhat'),('Sprint3','2023-02-21','2024-03-23','eatwhat');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `Task_name` varchar(65) NOT NULL,
  `Task_description` longtext NOT NULL,
  `Task_notes` longtext,
  `Task_id` varchar(255) NOT NULL,
  `Task_plan` varchar(255) DEFAULT NULL,
  `Task_app_Acronym` varchar(255) NOT NULL,
  `Task_state` varchar(255) NOT NULL,
  `Task_creator` varchar(255) NOT NULL,
  `Task_owner` varchar(255) NOT NULL,
  `Task_createDate` date NOT NULL,
  PRIMARY KEY (`Task_name`),
  UNIQUE KEY `Task_name_UNIQUE` (`Task_name`),
  UNIQUE KEY `Task_id_UNIQUE` (`Task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `userpassword` varchar(255) NOT NULL,
  `useremail` varchar(100) DEFAULT NULL,
  `usergroup` varchar(45) DEFAULT '.',
  `userisActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`userid`),
  UNIQUE KEY `user_id_UNIQUE` (`userid`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `useremail_UNIQUE` (`useremail`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (11,'test6','$2a$10$7KkKxOz8aUL8PlFayenbieh2oQAlaZLDcoKp6MDdUQ5qalR5OwwdW','plspls@hotmail.com','.admin.user.',1),(25,'test1','$2a$15$UmfY2ejEJ26EXRjz1uAS1OyAUMbf2UcLZgx4K3Z1h/zPU8y/WmQba','heaveheaven@heaven.com','.admin.dev.',1),(64,'user2','$2a$10$DT0ieGKpy6V7brg1DMBSvezPnTZBqUB1/jFqaqU19Qj.yAtStcuvS','hello@gmail.com','.user.',0),(67,'admin','$2a$10$b1RqBVB6erfCHfg19qXyf.YPkA0i4xcSf4FSNU2dvTpk91wucRNpC','admin@admin.com','.admin.',1),(70,'test7','$2a$10$Fgk71r7RQSeo1V6Y/Blx2eqkf6E9NvCkFZnaaYaZI1fhQEqXgqAjm','test8@hotmail.com','.user.',1),(76,'dev1','$2a$10$1Z9MurxNjxVYHByVivk7m.QridItUV8CqO.TAxZIRhiNZvha6cpqe',NULL,'.admin.',1);
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

-- Dump completed on 2023-07-28  8:57:54
