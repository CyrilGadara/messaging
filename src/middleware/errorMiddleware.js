const logger = require("../utils/logger");

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const notFound = (req, res, next) => {
    console.log(`Page Not Found - ${req.originalUrl}`);
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
    // res.status(404).render("error-page", {
    //     error: {
    //         title: "Not Found",
    //         errorTitle: "Error 404",
    //         message: `Page not found: ${req.originalUrl}`,
    //         stack: process.env.NODE_ENV === "development" ? new Error().stack : null,
    //     },
    // });
};

const errorHandler = (err, req, res, next) => {
    // Set default status code and status
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Log the error
    logger.error("Error:", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        requestId: req.id,
        url: req.originalUrl,
        method: req.method,
    });

    // Determine error details based on environment
    let errorDetails = {
        title: "Error",
        message: err.message,
        statusCode: err.statusCode,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    };

    // Handle specific error types in production
    if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError") {
            const castError = handleCastErrorDB(err);
            errorDetails.message = castError.message;
            errorDetails.statusCode = castError.statusCode;
        }
        if (err.code === 11000) {
            const duplicateError = handleDuplicateFieldsDB(err);
            errorDetails.message = duplicateError.message;
            errorDetails.statusCode = duplicateError.statusCode;
        }
        if (err.name === "ValidationError") {
            const validationError = handleValidationErrorDB(err);
            errorDetails.message = validationError.message;
            errorDetails.statusCode = validationError.statusCode;
        }
        if (err.name === "JsonWebTokenError") {
            const jwtError = handleJWTError();
            errorDetails.message = jwtError.message;
            errorDetails.statusCode = jwtError.statusCode;
        }
        if (err.name === "TokenExpiredError") {
            const jwtExpiredError = handleJWTExpiredError();
            errorDetails.message = jwtExpiredError.message;
            errorDetails.statusCode = jwtExpiredError.statusCode;
        }
    }

    // Render error page
    res.status(errorDetails.statusCode).render("error-page", {
        title: "Error",
        errorTitle: `Error ${errorDetails.statusCode}`,
        errorMessage: errorDetails.message,
        stack: errorDetails.stack,
    });
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401);

module.exports = {
    AppError,
    notFound,
    errorHandler,
};
