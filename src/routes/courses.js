const express = require('express');
const { Op } = require('sequelize');
const { Course, CourseOffering, User, Cohort, Mode, Class } = require('../models');
const { authorize } = require('../middleware/auth');
const { 
    courseValidation, 
    courseOfferingValidation, 
    idValidation, 
    queryValidation 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with filtering
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course name or code
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get('/', queryValidation, async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        isActive: true
    };

    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: courses } = await Course.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
    });

    res.json({
        success: true,
        data: {
            courses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        }
    });
});

// Course Offering Routes - Must come before /:id route to avoid conflicts

/**
 * @swagger
 * /api/courses/offerings:
 *   get:
 *     summary: Get course offerings with filtering
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trimester
 *         schema:
 *           type: string
 *           enum: [Fall, Spring, Summer]
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: modeId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course offerings retrieved successfully
 */
router.get('/offerings', queryValidation, async (req, res) => {
    const { page = 1, limit = 10, trimester, facilitatorId, modeId, intake } = req.query;
    const offset = (page - 1) * limit;

    const includeOptions = [
        { model: Course, as: 'course' },
        { model: User, as: 'facilitator', attributes: ['id', 'firstName', 'lastName'] },
        { model: Mode, as: 'mode' },
        { model: Class, as: 'class' }
    ];

    const cohortWhere = {};
    if (trimester) cohortWhere.trimester = trimester;
    if (intake) cohortWhere.intake = { [Op.like]: `%${intake}%` };

    if (Object.keys(cohortWhere).length > 0) {
        includeOptions.push({
            model: Cohort,
            as: 'cohort',
            where: cohortWhere
        });
    } else {
        includeOptions.push({ model: Cohort, as: 'cohort' });
    }

    const whereClause = {};
    if (facilitatorId) {
        // For facilitators, only show their assigned courses
        if (req.user.role === 'facilitator') {
            whereClause.facilitatorId = req.user.id;
        } else {
            whereClause.facilitatorId = facilitatorId;
        }
    } else if (req.user.role === 'facilitator') {
        whereClause.facilitatorId = req.user.id;
    }
    
    if (modeId) whereClause.modeId = modeId;

    const { count, rows: offerings } = await CourseOffering.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['startDate', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            offerings,
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
 * /api/courses/offerings:
 *   post:
 *     summary: Create course offering (Managers only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Course offering created successfully
 */
router.post('/offerings', authorize('manager'), courseOfferingValidation, async (req, res) => {
    const offering = await CourseOffering.create(req.body);
    
    const offeringWithDetails = await CourseOffering.findByPk(offering.id, {
        include: [
            { model: Course, as: 'course' },
            { model: User, as: 'facilitator', attributes: ['id', 'firstName', 'lastName'] },
            { model: Cohort, as: 'cohort' },
            { model: Mode, as: 'mode' },
            { model: Class, as: 'class' }
        ]
    });

    res.status(201).json({
        success: true,
        message: req.t('course.created'),
        data: { offering: offeringWithDetails }
    });
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
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
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get('/:id', idValidation, async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [
            {
                model: CourseOffering,
                as: 'offerings',
                include: [
                    { model: User, as: 'facilitator', attributes: ['id', 'firstName', 'lastName'] },
                    { model: Cohort, as: 'cohort' },
                    { model: Mode, as: 'mode' },
                    { model: Class, as: 'class' }
                ]
            }
        ]
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: req.t('course.not_found')
        });
    }

    res.json({
        success: true,
        data: { course }
    });
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Managers only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - credits
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               syllabus:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       403:
 *         description: Access forbidden
 */
router.post('/', authorize('manager'), courseValidation, async (req, res) => {
    const { code, name, description, credits, syllabus, prerequisites } = req.body;

    const course = await Course.create({
        code,
        name,
        description,
        credits,
        syllabus,
        prerequisites
    });

    res.status(201).json({
        success: true,
        message: req.t('course.created'),
        data: { course }
    });
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course (Managers only)
 *     tags: [Courses]
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
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 */
router.put('/:id', authorize('manager'), idValidation, courseValidation, async (req, res) => {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
        return res.status(404).json({
            success: false,
            message: req.t('course.not_found')
        });
    }

    await course.update(req.body);

    res.json({
        success: true,
        message: req.t('course.updated'),
        data: { course }
    });
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course (Managers only)
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:id', authorize('manager'), idValidation, async (req, res) => {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
        return res.status(404).json({
            success: false,
            message: req.t('course.not_found')
        });
    }

    await course.update({ isActive: false });

    res.json({
        success: true,
        message: req.t('course.deleted')
    });
});

module.exports = router;
