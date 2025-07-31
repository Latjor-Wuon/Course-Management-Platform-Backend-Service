const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertSampleData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('🔗 Connected to MySQL database');

        // Insert sample users with hashed passwords
        await connection.execute(`
            INSERT IGNORE INTO Users (email, password, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES 
            ('admin@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'System', 'Administrator', 'manager', true, NOW(), NOW()),
            ('manager@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'John', 'Manager', 'manager', true, NOW(), NOW()),
            ('facilitator1@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'Alice', 'Johnson', 'facilitator', true, NOW(), NOW()),
            ('facilitator2@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'Bob', 'Smith', 'facilitator', true, NOW(), NOW()),
            ('facilitator3@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'Carol', 'Davis', 'facilitator', true, NOW(), NOW()),
            ('student1@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'David', 'Wilson', 'student', true, NOW(), NOW()),
            ('student2@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'Emma', 'Brown', 'student', true, NOW(), NOW()),
            ('student3@coursemanagement.com', '$2b$12$LQv3c1yqBwEHXk.JHJPCpOXRfrmkE/SB9Hi/ErY.1aAMxOdTlACAK', 'Frank', 'Miller', 'student', true, NOW(), NOW())
        `);
        console.log('✅ Users inserted');

        // Insert delivery modes
        await connection.execute(`
            INSERT IGNORE INTO Modes (name, description, isActive, createdAt, updatedAt) VALUES 
            ('Online', 'Fully online delivery', true, NOW(), NOW()),
            ('In-Person', 'Traditional classroom setting', true, NOW(), NOW()),
            ('Hybrid', 'Combination of online and in-person', true, NOW(), NOW()),
            ('Blended', 'Mix of synchronous and asynchronous', true, NOW(), NOW())
        `);
        console.log('✅ Modes inserted');

        // Insert cohorts
        await connection.execute(`
            INSERT IGNORE INTO Cohorts (name, intake, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
            ('Fall 2025 Cohort A', 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
            ('Fall 2025 Cohort B', 'Fall2025', '2025-09-15', '2025-12-30', true, NOW(), NOW()),
            ('Spring 2026 Cohort', 'Spring2026', '2026-01-15', '2026-05-15', true, NOW(), NOW())
        `);
        console.log('✅ Cohorts inserted');

        // Insert courses
        await connection.execute(`
            INSERT IGNORE INTO Courses (code, name, description, credits, isActive, createdAt, updatedAt) VALUES 
            ('CS101', 'Introduction to Computer Science', 'Basic concepts of programming and computer science', 3, true, NOW(), NOW()),
            ('MATH201', 'Calculus I', 'Differential and integral calculus', 4, true, NOW(), NOW()),
            ('BUS301', 'Business Management', 'Fundamentals of business operations and management', 3, true, NOW(), NOW()),
            ('ENG102', 'Technical Writing', 'Professional communication and technical documentation', 2, true, NOW(), NOW()),
            ('CS202', 'Data Structures', 'Advanced programming concepts and data structures', 4, true, NOW(), NOW())
        `);
        console.log('✅ Courses inserted');

        // Insert classes
        await connection.execute(`
            INSERT IGNORE INTO Classes (name, cohortId, capacity, isActive, createdAt, updatedAt) VALUES 
            ('Class A-1', 1, 25, true, NOW(), NOW()),
            ('Class A-2', 1, 25, true, NOW(), NOW()),
            ('Class B-1', 2, 30, true, NOW(), NOW()),
            ('Class Spring-1', 3, 20, true, NOW(), NOW())
        `);
        console.log('✅ Classes inserted');

        // Insert students
        await connection.execute(`
            INSERT IGNORE INTO Students (userId, studentId, classId, enrollmentDate, isActive, createdAt, updatedAt) VALUES 
            (6, 'STU001', 1, NOW(), true, NOW(), NOW()),
            (7, 'STU002', 1, NOW(), true, NOW(), NOW()),
            (8, 'STU003', 2, NOW(), true, NOW(), NOW())
        `);
        console.log('✅ Students inserted');

        // Insert course offerings
        await connection.execute(`
            INSERT IGNORE INTO CourseOfferings (courseId, cohortId, facilitatorId, modeId, trimester, startDate, endDate, isActive, createdAt, updatedAt) VALUES 
            (1, 1, 3, 1, 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
            (2, 1, 4, 2, 'Fall2025', '2025-09-01', '2025-12-15', true, NOW(), NOW()),
            (3, 2, 5, 3, 'Fall2025', '2025-09-15', '2025-12-30', true, NOW(), NOW())
        `);
        console.log('✅ Course offerings inserted');

        // Get summary
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM Users');
        const [courses] = await connection.execute('SELECT COUNT(*) as count FROM Courses');
        const [cohorts] = await connection.execute('SELECT COUNT(*) as count FROM Cohorts');
        const [modes] = await connection.execute('SELECT COUNT(*) as count FROM Modes');
        const [offerings] = await connection.execute('SELECT COUNT(*) as count FROM CourseOfferings');

        console.log('\n📊 Database Summary:');
        console.log(`   - ${users[0].count} Users`);
        console.log(`   - ${courses[0].count} Courses`);
        console.log(`   - ${cohorts[0].count} Cohorts`);
        console.log(`   - ${modes[0].count} Delivery Modes`);
        console.log(`   - ${offerings[0].count} Course Offerings`);

        console.log('\n🔑 Test Credentials (all passwords: Pass123!):');
        console.log('   Manager: manager@coursemanagement.com');
        console.log('   Facilitator: facilitator1@coursemanagement.com');
        console.log('   Student: student1@coursemanagement.com');

        await connection.end();
        console.log('\n✅ Sample data insertion completed successfully!');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
        process.exit(1);
    }
}

insertSampleData();
