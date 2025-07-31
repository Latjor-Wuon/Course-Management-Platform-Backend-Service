const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Auth validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('role')
        .isIn(['manager', 'facilitator', 'student'])
        .withMessage('Role must be manager, facilitator, or student'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Course validation rules
const courseValidation = [
    body('code')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Course code must be between 3 and 20 characters'),
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Course name must be between 3 and 255 characters'),
    body('credits')
        .isInt({ min: 1, max: 10 })
        .withMessage('Credits must be between 1 and 10'),
    handleValidationErrors
];

// Course offering validation rules
const courseOfferingValidation = [
    body('courseId')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer'),
    body('cohortId')
        .isInt({ min: 1 })
        .withMessage('Cohort ID must be a positive integer'),
    body('facilitatorId')
        .isInt({ min: 1 })
        .withMessage('Facilitator ID must be a positive integer'),
    body('modeId')
        .isInt({ min: 1 })
        .withMessage('Mode ID must be a positive integer'),
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    handleValidationErrors
];

// Activity tracker validation rules
const activityTrackerValidation = [
    body('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer'),
    body('weekNumber')
        .isInt({ min: 1, max: 52 })
        .withMessage('Week number must be between 1 and 52'),
    body('activities')
        .optional()
        .isArray()
        .withMessage('Activities must be an array'),
    body('status')
        .optional()
        .isIn(['pending', 'submitted', 'late', 'missed'])
        .withMessage('Status must be pending, submitted, late, or missed'),
    handleValidationErrors
];

// ID parameter validation
const idValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    handleValidationErrors
];

// Query parameter validation for filtering
const queryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('trimester')
        .optional()
        .isIn(['Fall', 'Spring', 'Summer'])
        .withMessage('Trimester must be Fall, Spring, or Summer'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    courseValidation,
    courseOfferingValidation,
    activityTrackerValidation,
    idValidation,
    queryValidation
};
