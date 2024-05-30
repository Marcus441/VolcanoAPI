const error = require("../utils/error");

module.exports = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new error("Request body incomplete, both email and password are required", 400));
    }
    next();
}