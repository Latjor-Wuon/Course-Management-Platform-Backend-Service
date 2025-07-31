const express = require('express');
const { Op } = require('sequelize');
const { User, Student, Cohort } = require('../models');
const { authorize } = require('../middleware/auth');
const { idValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Managers only)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [manager, facilitator, student]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Access forbidden
 */
router.get('/', authorize('manager'), queryValidation, async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        isActive: true
    };

    if (role) {
        whereClause.role = role;
    }

    if (search) {
        whereClause[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
        success: true,
        data: {
            users,
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
 * /api/users/facilitators:
 *   get:
 *     summary: Get all facilitators
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Facilitators retrieved successfully
 */
router.get('/facilitators', async (req, res) => {
    const facilitators = await User.findAll({
        where: {
            role: 'facilitator',
            isActive: true
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'department'],
        order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
        success: true,
        data: { facilitators }
    });
});

/**
 * @swagger
 * /api/users/students:
 *   get:
 *     summary: Get all students (Managers only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/students', authorize('manager'), queryValidation, async (req, res) => {
    const { page = 1, limit = 10, cohortId, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (cohortId) whereClause.cohortId = cohortId;
    if (status) whereClause.status = status;

    const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Cohort,
                as: 'cohort',
                attributes: ['id', 'name', 'trimester', 'year']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['enrollmentDate', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            students,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', idValidation, async (req, res) => {
    const userId = req.params.id;
    
    // Users can only view their own profile unless they're managers
    if (req.user.role !== 'manager' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: req.t('auth.forbidden')
        });
    }

    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Student,
                as: 'studentProfile',
                include: [
                    {
                        model: Cohort,
                        as: 'cohort'
                    }
                ]
            }
        ]
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: req.t('user.not_found')
        });
    }

    res.json({
        success: true,
        data: { user }
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access forbidden
 */
router.put('/:id', idValidation, async (req, res) => {
    const userId = req.params.id;
    
    // Users can only update their own profile unless they're managers
    if (req.user.role !== 'manager' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({
            success: false,
            message: req.t('auth.forbidden')
        });
    }

    const user = await User.findByPk(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: req.t('user.not_found')
        });
    }

    // Prevent non-managers from changing roles
    if (req.user.role !== 'manager' && req.body.role) {
        delete req.body.role;
    }

    await user.update(req.body);

    const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
    });

    res.json({
        success: true,
        message: req.t('user.updated'),
        data: { user: updatedUser }
    });
});

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user (Managers only)
 *     tags: [Users]
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
 *         description: User deactivated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/deactivate', authorize('manager'), idValidation, async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: req.t('user.not_found')
        });
    }

    await user.update({ isActive: false });

    res.json({
        success: true,
        message: 'User deactivated successfully'
    });
});

module.exports = router;
