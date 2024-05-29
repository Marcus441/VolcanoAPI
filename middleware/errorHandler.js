
const error = require("../utils/error");

module.exports = (err, req, res, next) => {
    // Default to a 500 Internal Server Error if no status code is set
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";


    // Handle JWT invalid error
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid JWT token";
        err = new error(message, 401);
    }

    // Handle JWT expired error
    if (err.name === "TokenExpiredError") {
        const message = "JWT token has expired" ;
        err = new error(message, 401);
    }

    // Handle incorrect email or password error
    if (err.message === "Incorrect email or password") {
        err = new error(err.message, 401);
    }
    // Send error response
    res.status(err.statusCode).json({
        error: true,
        message: err.message
    });
}; 