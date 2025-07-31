const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseOffering:
 *       type: object
 *       required:
 *         - courseId
 *         - cohortId
 *         - facilitatorId
 *         - modeId
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: integer
 *           description: Course offering ID
 *         courseId:
 *           type: integer
 *           description: Reference to Course
 *         cohortId:
 *           type: integer
 *           description: Reference to Cohort
 *         facilitatorId:
 *           type: integer
 *           description: Reference to Facilitator (User)
 *         modeId:
 *           type: integer
 *           description: Reference to Mode
 *         classId:
 *           type: integer
 *           description: Reference to Class
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [scheduled, active, completed, cancelled]
 */

const CourseOffering = sequelize.define('CourseOffering', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (value <= this.startDate) {
                    throw new Error('End date must be after start date');
                }
            },
        },
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled',
    },
    maxEnrollment: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        },
    },
    currentEnrollment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    syllabus: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['courseId', 'cohortId', 'facilitatorId'],
            name: 'unique_course_cohort_facilitator'
        }
    ]
});

module.exports = CourseOffering;
