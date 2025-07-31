-- Sample data for Course Management Platform
-- Run these SQL commands to populate your database with test data

USE course_management;

-- Insert sample users
INSERT INTO Users (email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES 
('admin@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'System', 'Administrator', 'manager', true, NOW(), NOW()),
('manager@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'John', 'Manager', 'manager', true, NOW(), NOW()),
('facilitator1@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'Alice', 'Johnson', 'facilitator', true, NOW(), NOW()),
('facilitator2@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'Bob', 'Smith', 'facilitator', true, NOW(), NOW()),
('facilitator3@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP2sW5jK1aL3', 'Carol', 'Davis', 'facilitator', true, NOW(), NOW()),
('student1@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'David', 'Wilson', 'student', true, NOW(), NOW()),
('student2@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'Emma', 'Brown', 'student', true, NOW(), NOW()),
('student3@coursemanagement.com', '$2b$12$rF7P8QhG5x8V9mWnA2kLZe5kP7Q3RtY6bN4mV8cX9oP2sW5jK1aL3', 'Frank', 'Miller', 'student', true, NOW(), NOW());

-- Insert delivery modes
INSERT INTO Modes (name, description, isActive, createdAt, updatedAt) VALUES 
('Online', 'Fully online delivery', true, NOW(), NOW()),
('In-Person', 'Traditional classroom setting', true, NOW(), NOW()),
('Hybrid', 'Combination of online and in-person', true, NOW(), NOW()),
('Blended', 'Mix of synchronous and asynchronous', true, NOW(), NOW());

-- Insert cohorts
INSERT INTO Cohorts (name, intake, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
('Fall 2025 Cohort A', 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
('Fall 2025 Cohort B', 'Fall2025', '2025-09-15', '2025-12-30', true, NOW(), NOW()),
('Spring 2026 Cohort', 'Spring2026', '2026-01-15', '2026-05-15', true, NOW(), NOW());

-- Insert courses
INSERT INTO Courses (code, name, description, credits, isActive, createdAt, updatedAt) VALUES 
('CS101', 'Introduction to Computer Science', 'Basic concepts of programming and computer science', 3, true, NOW(), NOW()),
('MATH201', 'Calculus I', 'Differential and integral calculus', 4, true, NOW(), NOW()),
('BUS301', 'Business Management', 'Fundamentals of business operations and management', 3, true, NOW(), NOW()),
('ENG102', 'Technical Writing', 'Professional communication and technical documentation', 2, true, NOW(), NOW()),
('CS202', 'Data Structures', 'Advanced programming concepts and data structures', 4, true, NOW(), NOW());

-- Insert classes
INSERT INTO Classes (name, cohortId, capacity, isActive, createdAt, updatedAt) VALUES 
('Class A-1', 1, 25, true, NOW(), NOW()),
('Class A-2', 1, 25, true, NOW(), NOW()),
('Class B-1', 2, 30, true, NOW(), NOW()),
('Class Spring-1', 3, 20, true, NOW(), NOW());

-- Insert students
INSERT INTO Students (userId, studentId, classId, enrollmentDate, isActive, createdAt, updatedAt) VALUES 
(6, 'STU001', 1, NOW(), true, NOW(), NOW()),
(7, 'STU002', 1, NOW(), true, NOW(), NOW()),
(8, 'STU003', 2, NOW(), true, NOW(), NOW());

-- Insert course offerings
INSERT INTO CourseOfferings (courseId, cohortId, facilitatorId, modeId, trimester, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
(1, 1, 3, 1, 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
(2, 1, 4, 2, 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
(3, 2, 5, 3, 'Fall2025', '2025-09-15', '2025-12-30', true, NOW(), NOW());

-- Display summary
SELECT 'Sample data inserted successfully!' as Status;
SELECT 
    (SELECT COUNT(*) FROM Users) as Users,
    (SELECT COUNT(*) FROM Courses) as Courses,
    (SELECT COUNT(*) FROM Cohorts) as Cohorts,
    (SELECT COUNT(*) FROM Classes) as Classes,
    (SELECT COUNT(*) FROM Modes) as Modes,
    (SELECT COUNT(*) FROM Students) as Students,
    (SELECT COUNT(*) FROM CourseOfferings) as CourseOfferings;
