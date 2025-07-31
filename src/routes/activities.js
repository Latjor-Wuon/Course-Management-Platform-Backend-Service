const express = require('express');
const { ActivityTracker, CourseOffering, User, Course } = require('../models');
const { authorize } = require('../middleware/auth');
const { activityTrackerValidation, idValidation, queryValidation } = require('../middleware/validation');
const { addToQueue } = require('../services/notificationService');
const { sequelize } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity tracking endpoints
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get activity trackers
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, submitted, late, missed]
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Activity trackers retrieved successfully
 */
router.get('/', queryValidation, async (req, res) => {
    const { page = 1, limit = 10, status, facilitatorId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // Role-based filtering
    if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.id;
    } else if (facilitatorId && req.user.role === 'manager') {
        whereClause.facilitatorId = facilitatorId;
    }
    
    if (status) {
        whereClause.status = status;
    }

    const { count, rows: activities } = await ActivityTracker.findAndCountAll({
        where: whereClause,
        include: [
            { 
                model: User, 
                as: 'facilitator', 
                attributes: ['id', 'firstName', 'lastName'] 
            },
            {
                model: CourseOffering,
                as: 'courseOffering',
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'name', 'code'] }
                ]
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['weekNumber', 'ASC'], ['dueDate', 'ASC']]
    });

    res.json({
        success: true,
        data: {
            activities,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity tracker by ID
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Activity tracker retrieved successfully
 *       404:
 *         description: Activity tracker not found
 */
router.get('/:id', idValidation, async (req, res) => {
    const whereClause = { id: req.params.id };
    
    // Facilitators can only view their own activities
    if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.id;
    }

    const activity = await ActivityTracker.findOne({
        where: whereClause,
        include: [
            { 
                model: User, 
                as: 'facilitator', 
                attributes: ['id', 'firstName', 'lastName'] 
            },
            {
                model: CourseOffering,
                as: 'courseOffering',
                include: [
                    { model: Course, as: 'course' }
                ]
            }
        ]
    });

    if (!activity) {
        return res.status(404).json({
            success: false,
            message: req.t('activity.not_found')
        });
    }

    res.json({
        success: true,
        data: { activity }
    });
});

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create activity tracker log (Facilitators only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseOfferingId
 *               - weekNumber
 *             properties:
 *               courseOfferingId:
 *                 type: integer
 *               weekNumber:
 *                 type: integer
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *               attendanceCount:
 *                 type: integer
 *               challenges:
 *                 type: string
 *               achievements:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity tracker created successfully
 *       403:
 *         description: Access forbidden
 */
router.post('/', authorize('facilitator'), activityTrackerValidation, async (req, res) => {
    const { courseOfferingId, weekNumber, activities, notes, attendanceCount, challenges, achievements } = req.body;

    // Verify the course offering exists (removed facilitator restriction)
    const courseOffering = await CourseOffering.findByPk(courseOfferingId);

    if (!courseOffering) {
        return res.status(404).json({
            success: false,
            message: 'Course offering not found'
        });
    }

    // Check if activity tracker already exists for this week and facilitator
    const existingActivity = await ActivityTracker.findOne({
        where: {
            courseOfferingId,
            facilitatorId: req.user.id,
            weekNumber
        }
    });

    if (existingActivity) {
        return res.status(409).json({
            success: false,
            message: 'Activity tracker already exists for this week'
        });
    }

    // Calculate due date (assuming weekly submissions, due on Sundays)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (7 - dueDate.getDay())); // Next Sunday
    dueDate.setHours(23, 59, 59, 999);

    const activity = await ActivityTracker.create({
        courseOfferingId,
        facilitatorId: req.user.id,
        weekNumber,
        activities,
        notes,
        attendanceCount,
        challenges,
        achievements,
        dueDate,
        status: 'submitted',
        submittedAt: new Date()
    });

    const activityWithDetails = await ActivityTracker.findByPk(activity.id, {
        include: [
            { 
                model: User, 
                as: 'facilitator', 
                attributes: ['id', 'firstName', 'lastName'] 
            },
            {
                model: CourseOffering,
                as: 'courseOffering',
                include: [
                    { model: Course, as: 'course' }
                ]
            }
        ]
    });

    res.status(201).json({
        success: true,
        message: req.t('activity.logged'),
        data: { activity: activityWithDetails }
    });
});

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update activity tracker (Facilitators only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Activity tracker updated successfully
 *       404:
 *         description: Activity tracker not found
 */
router.put('/:id', authorize('facilitator'), idValidation, async (req, res) => {
    const activity = await ActivityTracker.findOne({
        where: {
            id: req.params.id,
            facilitatorId: req.user.id
        }
    });

    if (!activity) {
        return res.status(404).json({
            success: false,
            message: req.t('activity.not_found')
        });
    }

    const updateData = { ...req.body };
    
    // If activities are being updated, mark as submitted
    if (updateData.activities) {
        updateData.status = 'submitted';
        updateData.submittedAt = new Date();
    }

    await activity.update(updateData);

    const updatedActivity = await ActivityTracker.findByPk(activity.id, {
        include: [
            { 
                model: User, 
                as: 'facilitator', 
                attributes: ['id', 'firstName', 'lastName'] 
            },
            {
                model: CourseOffering,
                as: 'courseOffering',
                include: [
                    { model: Course, as: 'course' }
                ]
            }
        ]
    });

    res.json({
        success: true,
        message: req.t('activity.updated'),
        data: { activity: updatedActivity }
    });
});

/**
 * @swagger
 * /api/activities/overview:
 *   get:
 *     summary: Get activity tracking overview (Managers only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity overview retrieved successfully
 */
router.get('/overview', authorize('manager'), async (req, res) => {
    const stats = await ActivityTracker.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
    });

    const lateActivities = await ActivityTracker.findAll({
        where: {
            status: ['late', 'missed']
        },
        include: [
            { 
                model: User, 
                as: 'facilitator', 
                attributes: ['id', 'firstName', 'lastName'] 
            },
            {
                model: CourseOffering,
                as: 'courseOffering',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'code'] }
                ]
            }
        ],
        order: [['dueDate', 'DESC']],
        limit: 10
    });

    res.json({
        success: true,
        data: {
            stats,
            lateActivities
        }
    });
});

module.exports = router;
