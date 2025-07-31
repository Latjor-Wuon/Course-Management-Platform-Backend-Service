const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cohort:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: integer
 *           description: Cohort ID
 *         name:
 *           type: string
 *           description: Cohort name
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         trimester:
 *           type: string
 *           enum: [Fall, Spring, Summer]
 *         year:
 *           type: integer
 *         intake:
 *           type: string
 */

const Cohort = sequelize.define('Cohort', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 100],
        },
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
    trimester: {
        type: DataTypes.ENUM('Fall', 'Spring', 'Summer'),
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2020,
            max: 2030,
        },
    },
    intake: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Intake identifier (e.g., January 2025)',
    },
    maxStudents: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

module.exports = Cohort;
