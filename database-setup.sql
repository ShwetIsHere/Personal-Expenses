-- ============================================
-- FIQ Finance Manager - Database Setup Script
-- ============================================
-- Run this script in MySQL to create the database structure
-- 
-- Instructions:
-- 1. Open MySQL Command Line or MySQL Workbench
-- 2. Login as root
-- 3. Copy and paste this entire script
-- 4. Press Enter to execute
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS personal;
USE personal;

-- ============================================
-- Table: login
-- User authentication
-- ============================================
CREATE TABLE IF NOT EXISTS login (
  uname VARCHAR(20) NOT NULL PRIMARY KEY,
  pass VARCHAR(50) DEFAULT NULL,
  profile_pic LONGBLOB DEFAULT NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO login (uname, pass) VALUES ('admin', 'admin123')
ON DUPLICATE KEY UPDATE pass=pass;

-- ============================================
-- Table: vehicle
-- Vehicle information
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle (
  vehicle_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(50) DEFAULT NULL,
  owner_name VARCHAR(50) DEFAULT NULL,
  chassis_number VARCHAR(20) DEFAULT NULL
);

-- ============================================
-- Table: fuel
-- Fuel expense tracking
-- ============================================
CREATE TABLE IF NOT EXISTS fuel (
  entry_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  date DATE DEFAULT NULL,
  total_cost DECIMAL(10,2) DEFAULT NULL,
  odometer INT DEFAULT NULL
);

-- ============================================
-- Table: service
-- Vehicle service records
-- ============================================
CREATE TABLE IF NOT EXISTS service (
  service_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) DEFAULT NULL,
  service_date DATE DEFAULT NULL,
  odometer INT DEFAULT NULL,
  service_type VARCHAR(50) DEFAULT NULL,
  cost DECIMAL(10,2) DEFAULT NULL
);

-- ============================================
-- Table: insurance
-- Insurance policy tracking
-- ============================================
CREATE TABLE IF NOT EXISTS insurance (
  insurance_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) DEFAULT NULL,
  company VARCHAR(50) DEFAULT NULL,
  policy_no VARCHAR(50) DEFAULT NULL,
  start DATE DEFAULT NULL,
  end DATE DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  type VARCHAR(30) DEFAULT NULL,
  renew_date DATE DEFAULT NULL
);

-- ============================================
-- Table: platforms
-- Gaming platforms information
-- ============================================
CREATE TABLE IF NOT EXISTS platforms (
  platform_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  platform_name VARCHAR(50) DEFAULT NULL,
  account_username VARCHAR(50) DEFAULT NULL,
  account_email VARCHAR(100) DEFAULT NULL
);

-- ============================================
-- Table: games
-- Game library tracking
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  game_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) DEFAULT NULL,
  platform VARCHAR(50) DEFAULT NULL,
  date DATE DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT NULL
);

-- ============================================
-- Table: study
-- Educational expenses
-- ============================================
CREATE TABLE IF NOT EXISTS study (
  entry_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  date DATE DEFAULT NULL
);

-- ============================================
-- Table: other
-- Other miscellaneous expenses
-- Updated structure with Type and Topic
-- ============================================
DROP TABLE IF EXISTS other;

CREATE TABLE other (
  entry_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) DEFAULT NULL COMMENT 'Category: Entertainment, Food, Trip, etc.',
  topic VARCHAR(100) DEFAULT NULL COMMENT 'Description/topic of expense',
  date DATE DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT NULL
);

-- ============================================
-- Sample Data (Optional - Remove if not needed)
-- ============================================

-- Sample platform
INSERT INTO platforms (platform_name, account_username, account_email) 
VALUES 
  ('Steam', 'player123', 'player@email.com'),
  ('Epic Games', 'gamer456', 'gamer@email.com')
ON DUPLICATE KEY UPDATE platform_name=platform_name;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if all tables were created successfully
SELECT 'Tables created successfully!' AS Status;

SHOW TABLES;

SELECT COUNT(*) AS 'Total Tables' FROM information_schema.tables 
WHERE table_schema = 'personal';

-- ============================================
-- Database Setup Complete!
-- ============================================
-- You can now launch FIQ Finance Manager
-- Default login: admin / admin123
-- Remember to change your password!
-- ============================================
