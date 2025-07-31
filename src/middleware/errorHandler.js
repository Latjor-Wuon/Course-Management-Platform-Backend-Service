const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);

    // Default error response
    let response = {
        success: false,
        message: req.t ? req.t('general.server_error') : 'Internal server error',
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development') {
        response.error = error.message;
        response.stack = error.stack;
    }

    // Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
        response.message = 'Validation error';
        response.errors = error.errors.map(err => ({
            field: err.path,
            message: err.message
        }));
        return res.status(400).json(response);
    }

    // Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
        response.message = 'Resource already exists';
        response.field = error.errors[0]?.path;
        return res.status(409).json(response);
    }

    // Sequelize foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        response.message = 'Invalid reference to related resource';
        return res.status(400).json(response);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        response.message = req.t ? req.t('auth.unauthorized') : 'Invalid token';
        return res.status(401).json(response);
    }

    if (error.name === 'TokenExpiredError') {
        response.message = req.t ? req.t('auth.token_expired') : 'Token expired';
        return res.status(401).json(response);
    }

    // Custom application errors
    if (error.statusCode) {
        response.message = error.message;
        return res.status(error.statusCode).json(response);
    }

    // Default server error
    res.status(500).json(response);
};

module.exports = errorHandler;
