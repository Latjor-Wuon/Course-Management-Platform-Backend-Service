const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - studentId
 *         - userId
 *         - cohortId
 *       properties:
 *         id:
 *           type: integer
 *           description: Internal student ID
 *         studentId:
 *           type: string
 *           description: Student identifier
 *         userId:
 *           type: integer
 *           description: Reference to User
 *         cohortId:
 *           type: integer
 *           description: Reference to Cohort
 *         enrollmentDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated, dropped]
 *         gpa:
 *           type: number
 *           format: float
 */

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [5, 20],
        },
    },
    enrollmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated', 'dropped'),
        allowNull: false,
        defaultValue: 'active',
    },
    gpa: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0.00,
            max: 4.00,
        },
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 4,
        },
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Student;
