const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - name
 *         - room
 *         - schedule
 *       properties:
 *         id:
 *           type: integer
 *           description: Class ID
 *         name:
 *           type: string
 *           description: Class name
 *         room:
 *           type: string
 *           description: Room number or location
 *         schedule:
 *           type: object
 *           description: Class schedule information
 *         maxCapacity:
 *           type: integer
 *           description: Maximum student capacity
 */

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 100],
        },
    },
    room: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50],
        },
    },
    schedule: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Schedule object with days, times, etc.',
    },
    maxCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        },
    },
    equipment: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Available equipment in the class',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

module.exports = Class;
