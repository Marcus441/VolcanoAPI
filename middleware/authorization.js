const jwt = require('jsonwebtoken');
const error = require('../utils/error');
require("dotenv").config();

module.exports = function (req, res, next) {
    if (!("authorization" in req.headers)) {
        return next(new error("Authorization header ('Bearer token') not found", 401));
    }
    if (!req.headers.authorization.match(/^Bearer /)) {
        return next(new error("Authorization header is malformed", 401));
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        next(e);
    }
    next();
};

