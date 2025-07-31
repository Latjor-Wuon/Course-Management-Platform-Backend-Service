#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Course Management Platform...\n');

// Check if .env file exists and has required values
function checkEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found. Please copy .env.example to .env and configure it.');
        return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    
    for (const varName of requiredVars) {
        if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
            console.log(`❌ Please configure ${varName} in your .env file`);
            return false;
        }
    }
    
    console.log('✅ Environment configuration looks good');
    return true;
}

// Check if MySQL is accessible
function checkMysql() {
    try {
        const { DB_HOST, DB_USER, DB_PASSWORD } = require('dotenv').config().parsed;
        execSync(`mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;"`, { stdio: 'ignore' });
        console.log('✅ MySQL connection successful');
        return true;
    } catch (error) {
        console.log('❌ MySQL connection failed. Please ensure MySQL is running and credentials are correct.');
        console.log('   You can test manually with: mysql -h localhost -u root -p');
        return false;
    }
}

// Check if Redis is accessible
function checkRedis() {
    try {
        execSync('redis-cli ping', { stdio: 'ignore' });
        console.log('✅ Redis connection successful');
        return true;
    } catch (error) {
        console.log('❌ Redis connection failed. Please ensure Redis is running.');
        console.log('   Start Redis with: redis-server');
        return false;
    }
}

// Create database if it doesn't exist
function createDatabase() {
    try {
        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('dotenv').config().parsed;
        execSync(`mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"`, { stdio: 'ignore' });
        console.log('✅ Database created/verified');
        return true;
    } catch (error) {
        console.log('❌ Failed to create database:', error.message);
        return false;
    }
}

// Run migrations
function runMigrations() {
    try {
        execSync('npm run db:migrate', { stdio: 'inherit' });
        console.log('✅ Database migrations completed');
        return true;
    } catch (error) {
        console.log('❌ Failed to run migrations');
        return false;
    }
}

// Run seeders
function runSeeders() {
    try {
        execSync('npm run db:seed', { stdio: 'inherit' });
        console.log('✅ Database seeding completed');
        return true;
    } catch (error) {
        console.log('❌ Failed to run seeders');
        return false;
    }
}

// Main setup function
async function setup() {
    console.log('Checking prerequisites...\n');
    
    if (!checkEnvFile()) {
        process.exit(1);
    }
    
    if (!checkMysql()) {
        console.log('\n📋 MySQL Setup Instructions:');
        console.log('1. Install MySQL: https://dev.mysql.com/downloads/mysql/');
        console.log('2. Start MySQL service');
        console.log('3. Update DB_PASSWORD in .env file');
        process.exit(1);
    }
    
    if (!checkRedis()) {
        console.log('\n📋 Redis Setup Instructions:');
        console.log('1. Install Redis: https://redis.io/download');
        console.log('2. Start Redis: redis-server');
        process.exit(1);
    }
    
    console.log('\n🔧 Setting up database...\n');
    
    if (!createDatabase()) {
        process.exit(1);
    }
    
    if (!runMigrations()) {
        process.exit(1);
    }
    
    if (!runSeeders()) {
        process.exit(1);
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit API docs: http://localhost:3000/api-docs');
    console.log('3. Visit reflection page: http://localhost:3000/reflection');
    console.log('\n👤 Test credentials:');
    console.log('Manager: manager@coursemanagement.com / ManagerPass123!');
    console.log('Facilitator: facilitator1@coursemanagement.com / FacilitatorPass123!');
    console.log('Student: student1@coursemanagement.com / StudentPass123!');
}

setup().catch(console.error);
