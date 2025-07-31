const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityTracker:
 *       type: object
 *       required:
 *         - courseOfferingId
 *         - facilitatorId
 *         - weekNumber
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity tracker ID
 *         courseOfferingId:
 *           type: integer
 *           description: Reference to CourseOffering
 *         facilitatorId:
 *           type: integer
 *           description: Reference to Facilitator (User)
 *         weekNumber:
 *           type: integer
 *           description: Week number in the course
 *         activities:
 *           type: array
 *           items:
 *             type: object
 *           description: List of activities conducted
 *         status:
 *           type: string
 *           enum: [pending, submitted, late, missed]
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 */

const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    weekNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 52,
        },
    },
    activities: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of activities with details like topic, duration, type, etc.',
    },
    status: {
        type: DataTypes.ENUM('pending', 'submitted', 'late', 'missed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    attendanceCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    challenges: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    achievements: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['courseOfferingId', 'facilitatorId', 'weekNumber'],
            name: 'unique_course_facilitator_week'
        }
    ]
});

module.exports = ActivityTracker;
