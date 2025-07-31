const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - credits
 *       properties:
 *         id:
 *           type: integer
 *           description: Course ID
 *         code:
 *           type: string
 *           description: Course code (e.g., CS101)
 *         name:
 *           type: string
 *           description: Course name
 *         description:
 *           type: string
 *           description: Course description
 *         credits:
 *           type: integer
 *           description: Number of credits
 *         isActive:
 *           type: boolean
 *           description: Whether course is active
 */

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20],
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 255],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10,
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    prerequisites: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of course IDs that are prerequisites',
    },
    syllabus: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Course;
